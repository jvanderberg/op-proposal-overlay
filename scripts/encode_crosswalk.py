#!/usr/bin/env python
"""Faithful proposed-zoning encoding: apply Opticos's district crosswalk to Oak
Park's EXISTING zoning layer, then assign each parcel its district by location.
No color-guessing — deterministic from the report's Article 3 conversion."""
import json, numpy as np
from shapely.geometry import shape, Point
from shapely.strtree import STRtree

PARCELS = "/Users/joshv/git/oak-park-properties/app/public/parcels.geojson"

# Opticos Article 3 crosswalk (existing -> proposed)
CROSS = {
    "R-1":"N-1",
    "R-2":"N-2","R-3-50":"N-2","R-3-35":"N-2","R-4":"N-2","R-5":"N-2",
    "R-6":"N-3","R-7":"N-3",
    "DT-1":"DT-1","DT-2":"DT-2","DT-3":"DT-3",
    "HS":"M-1","NC":"M-1",
    "RR":"M-2",
    "GC":"M-3","MS":"M-3","NA":"M-3",
    # special-purpose districts: report proposes no change
    "H":"H","I":"I","OS":"OS","P-R":"P-R",
}
NAMES = {"DT-1":"Downtown Central Sub-District","DT-2":"Hemingway Sub-District",
    "DT-3":"Pleasant Sub-District","M-1":"Mixed-Use 1","M-2":"Mixed-Use 2","M-3":"Mixed-Use 3",
    "N-1":"Neighborhood 1","N-2":"Neighborhood 2","N-3":"Neighborhood 3",
    "H":"Hospital (unchanged)","I":"Institutional (unchanged)","OS":"Open Space (unchanged)",
    "P-R":"Public Right-of-Way (unchanged)"}

# --- load existing zoning polygons, build spatial index ---
ez = json.load(open("existing_zoning.geojson"))
zgeoms, zcodes = [], []
for f in ez["features"]:
    g = shape(f["geometry"])
    zgeoms.append(g); zcodes.append(f["properties"]["ZONED"])
    f["properties"]["proposed_zone"] = CROSS.get(f["properties"]["ZONED"], f["properties"]["ZONED"])
    f["properties"]["proposed_name"] = NAMES.get(f["properties"]["proposed_zone"], "")
json.dump(ez, open("existing_zoning_crosswalked.geojson","w"))
tree = STRtree(zgeoms)

# --- join parcels to the district that contains them ---
pj = json.load(open(PARCELS)); feats = pj["features"]
from collections import Counter
summ = Counter(); miss = 0
for f in feats:
    geom = shape(f["geometry"])
    pt = geom.representative_point()
    ez_code = None
    for idx in tree.query(pt):
        if zgeoms[idx].contains(pt):
            ez_code = zcodes[idx]; break
    if ez_code is None:                       # fall back to nearest district centroid
        idx = min(range(len(zgeoms)), key=lambda i: zgeoms[i].distance(pt))
        ez_code = zcodes[idx]; miss += 1
    prop = CROSS.get(ez_code, ez_code)
    f["properties"]["existing_zone"] = ez_code
    f["properties"]["proposed_zone"] = prop
    f["properties"]["proposed_name"] = NAMES.get(prop, "")
    summ[prop]+=1
json.dump(pj, open("parcels_proposed_zoning.geojson","w"))

n=len(feats)
print(f"parcels: {n}   (nearest-fallback used for {miss})")
order=["DT-1","DT-2","DT-3","M-3","M-2","M-1","N-3","N-2","N-1","H","I","OS","P-R"]
for k in order:
    if summ.get(k): print(f"  {k:5s} {summ[k]:6d} ({100*summ[k]/n:4.1f}%)  {NAMES.get(k,'')}")
json.dump({"summary":dict(summ),"total":n}, open("zoning_summary.json","w"), indent=2)

# --- preview render, using proposed-map district colors ---
import rasterio
from rasterio.transform import Affine
from rasterio.features import rasterize
from PIL import Image
COL={"DT-1":(28,74,101),"DT-2":(101,182,203),"DT-3":(192,229,229),"M-3":(192,32,38),
     "M-2":(237,30,50),"M-1":(237,118,116),"N-3":(245,126,32),"N-2":(254,190,20),
     "N-1":(255,230,0),"H":(210,210,210),"I":(210,210,210),"OS":(200,220,200),"P-R":(235,235,235)}
t=json.load(open("transform.json")); tr=Affine(t["mX"],0,t["bX"],0,t["mY"],t["bY"]); W,H=t["W"],t["H"]
lab=rasterize([(f["geometry"],i+1) for i,f in enumerate(feats)],out_shape=(H,W),transform=tr,fill=0,dtype=np.int32)
lut=np.zeros((n+1,3),np.uint8)
for i,f in enumerate(feats): lut[i+1]=COL.get(f["properties"]["proposed_zone"],(230,230,230))
prev=lut[lab]; prev[lab==0]=(255,255,255)
Image.fromarray(prev).crop((232,842,2992,6006)).resize((760,1421)).save("crosswalk_preview.png")
print("wrote crosswalk_preview.png")
