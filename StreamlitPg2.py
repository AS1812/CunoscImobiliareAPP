import streamlit as st
#import pandas as pd
#import geopandas as gpd
import folium
#import branca.colormap as cm
import json
from streamlit_folium import folium_static

st.set_page_config(layout="wide")

data_geo = json.load(open('mapz-20220528-002745.geojson'))

#showing the maps
m = folium.Map(location=[45.72,21.20])
folium_static(m, width=1600, height=950)