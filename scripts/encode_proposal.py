#!/usr/bin/env python
"""Encode Opticos Place Types proposal onto Oak Park parcels.
Reads the georeferenced Place Types raster, classifies each pixel to a place
type, rasterizes parcels in the same grid, and assigns each parcel a place type
by majority of its area washes (+ corridor frontage adjacency)."""
import json, numpy as np
import rasterio
from rasterio.transform import Affine
from rasterio.features import rasterize
from scipy.ndimage import binary_dilation

PARCELS = "/Users/joshv/git/oak-park-properties/app/public/parcels.geojson"
OUT = "parcels_proposal.geojson"

t = json.load(open("transform.json"))
transform = Affine(t["mX"], 0, t["bX"], 0, t["mY"], t["bY"])
W, H = t["W"], t["H"]

# --- classify the Place Types raster ---
with rasterio.open("placetypes_200.png") as ds:
    a = ds.read().transpose(1, 2, 0).astype(int)  # H,W,3
R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]

# teal / Downtown: green & blue clearly above red (excludes gray where R≈G≈B)
downtown   = (G - R > 12) & (B - R > 6) & (G > 120) & (R < 165)
# yellow / Neighborhood Center: warm and bright, G high, blue low (distinct from salmon)
nbhd_ctr   = (R > 205) & (G > 160) & (B < 175) & (R - B > 45) & (G - B > 25)
# vivid orange corridor lines
corridor   = (R > 210) & (G > 60) & (G < 150) & (B < 90)
# dark red commercial building footprints
commercial = (R > 100) & (R < 170) & (G < 70) & (B < 80)

# class codes: 2 center, 3 downtown, 4 corridor, 5 commercial (fabric is the default)
cls = np.zeros((H, W), np.uint8)
cls[nbhd_ctr]   = 2
cls[downtown]   = 3
cls[commercial] = 5
cls[corridor]   = 4
# corridor influence: dilate corridor + commercial into adjacent blocks (~32px ~= 30m)
corr_infl = binary_dilation(corridor | commercial, iterations=32)

# --- rasterize parcels to a label grid ---
pj = json.load(open(PARCELS))
feats = pj["features"]
shapes = [(f["geometry"], i+1) for i, f in enumerate(feats)]
labels = rasterize(shapes, out_shape=(H, W), transform=transform, fill=0,
                   dtype=np.int32, all_touched=False)
n = len(feats)

# per-parcel pixel counts per class via bincount
def counts_for(mask):
    lab = labels[mask]
    return np.bincount(lab, minlength=n+1)[1:]
tot   = np.bincount(labels.ravel(), minlength=n+1)[1:].astype(float)
c_ctr = counts_for(cls == 2)
c_dt  = counts_for(cls == 3)
c_com = counts_for(cls == 5)
c_corr_infl = counts_for(corr_infl)
totm = np.maximum(tot, 1)

# --- decide place type per parcel (fraction of TOTAL parcel area) ---
place = np.empty(n, dtype=object)
frac_dt   = c_dt / totm
frac_ctr  = c_ctr / totm
frac_corr = c_corr_infl / totm
for i in range(n):
    if tot[i] < 4:
        place[i] = "Neighborhood Fabric"      # tiny/condo parcel, default
    elif frac_dt[i] >= 0.15 and c_dt[i] >= 6:
        place[i] = "Downtown"
    elif frac_ctr[i] >= 0.15 and c_ctr[i] >= 6:
        place[i] = "Neighborhood Center"
    elif frac_corr[i] >= 0.22:
        place[i] = "Corridor"
    else:
        place[i] = "Neighborhood Fabric"

# commercial-building flag (existing mixed-use/commercial footprint present)
comm_flag = (c_com >= 8)

# --- write enriched geojson ---
from collections import Counter
summary = Counter(place.tolist())
for i, f in enumerate(feats):
    f["properties"]["place_type"] = place[i]
    f["properties"]["commercial_bldg"] = bool(comm_flag[i])
json.dump(pj, open(OUT, "w"))
json.dump({"summary": dict(summary), "total": n}, open("proposal_summary.json", "w"), indent=2)

print(f"parcels: {n}")
for k, v in sorted(summary.items(), key=lambda x:-x[1]):
    print(f"  {k:22s} {v:6d}  ({100*v/n:4.1f}%)")
print(f"  commercial_bldg flag: {int(comm_flag.sum())}")
print(f"mean sampled px/parcel: {tot.mean():.0f}")

# --- preview: paint each parcel by place type over the grid ---
COLORS = {"Downtown":(38,132,152),"Neighborhood Center":(230,170,60),
          "Corridor":(226,110,45),"Neighborhood Fabric":(150,180,200)}
code = {"Downtown":3,"Neighborhood Center":2,"Corridor":4,"Neighborhood Fabric":1}
pcode = np.array([code[p] for p in place], dtype=np.uint8)
lut = np.zeros((n+1,), np.uint8); lut[1:] = pcode
parcel_class = lut[labels]  # H,W class per pixel (0 outside parcels)
prev = np.full((H, W, 3), 255, np.uint8)
inv = {v:k for k,v in code.items()}
for c, nm in inv.items():
    prev[parcel_class == c] = COLORS[nm]
prev[(labels>0) & (parcel_class==0)] = (150,180,200)
from PIL import Image as I2  # not in venv -> fallback to rasterio write
try:
    I2.fromarray(prev).crop((285,880,2930,5980)).resize((760,1470)).save("parcels_proposal_preview.png")
except Exception:
    import rasterio
    sub = prev[880:5980,285:2930][::4,::4]
    with rasterio.open("parcels_proposal_preview.png","w",driver="PNG",
                       height=sub.shape[0],width=sub.shape[1],count=3,dtype="uint8") as ds:
        ds.write(sub.transpose(2,0,1))
print("wrote parcels_proposal_preview.png")
