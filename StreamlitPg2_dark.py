import pandas as pd
import streamlit as st
from streamlit_folium import folium_static
import folium
import geopandas as gpd
import plotly.express as px
from st_aggrid import AgGrid

st.set_page_config(layout="wide")

def set_bg():
    st.markdown(
        f"""
         <style>
         
         .stApp {{
             background: url("https://dl.dropbox.com/s/morqn6674wqgkmk/Backround_Diploma.png?dl=0"); 
         }}
         .css-18e3th9 {{
             padding-top: 30px;
             padding-bottom: 0px;
             padding-left: 80px;
             padding-right: 80px;
         }}

         </style>
         """,
        unsafe_allow_html=True
    )

set_bg()

fname = 'map.geojson'
nil = gpd.read_file(fname)

m = folium.Map(location=[45.758, 21.227], zoom_start=12, tiles="CartoDB dark_matter",
               name='Timișoara Real Estate Statistics',
               attr="My Data attribution")

col1, col2, col3 = st.columns((1, 1.5, 1.5))

with col1:
    choice2 = ['1 Room', '2 Rooms', '3 Rooms', '4 Rooms']

    choice_selected2 = st.radio("Select the number of rooms.", choice2,
                                help='The selected choice represents the desired number of rooms.')

    choice1 = ['AveragePrice', 'MinimumPrice', 'MaximumPrice', 'AveragePrice_PerSquareMeter', 'NumberListings', 'AverageSquareMeters']

    choice_selected1 = st.radio("Choose an option for representation. "
                                "Prices are expressed in euros with VAT included.", choice1,
                                help='The selected choice will be represented on the map for each region.'
                                     'For example, if "AveragePrice" is selected, the average price will be displayed in'
                                     'each region, along with its name, and a color differentiation will be made.')

    color = st.color_picker(' ', '#3FCCE6')

fname = 'map.geojson'
nil = gpd.read_file(fname)
nil = nil[['geometry', 'text']]
cam1 = pd.read_csv('sql_query_1cam.csv')
cam2 = pd.read_csv('sql_query_2cam.csv')
cam3 = pd.read_csv('sql_query_3cam.csv')
cam4 = pd.read_csv('sql_query_4cam.csv')

if choice_selected2 == '1 Room':
    df_final = nil.merge(cam1, left_on="text", right_on="ApartmentZone", how="inner")
if choice_selected2 == '2 Rooms':
    df_final = nil.merge(cam2, left_on="text", right_on="ApartmentZone", how="inner")
if choice_selected2 == '3 Rooms':
    df_final = nil.merge(cam3, left_on="text", right_on="ApartmentZone", how="inner")
if choice_selected2 == '4 Rooms':
    df_final = nil.merge(cam4, left_on="text", right_on="ApartmentZone", how="inner")

with col1:
    grid_response = AgGrid(
        df_final[['ApartmentZone', choice_selected1]],
        data_return_mode='AS_INPUT',
        update_mode='MODEL_CHANGED',
        fit_columns_on_grid_load=True,
        height=360,
        width="100%",
        reload_data=True,
        theme='balham'
    )

    Link_Figma = f"""
    		<style>
            
    		#Link {{
    		  position: fixed;
    		  bottom: 50px;
    		  color: {color}
    		}}

    		</style>	

    		<a href="https://www.figma.com/proto/cpSU7EkLWqVp4pwA8ztZjU/Proiect_diploma?node-id=1%3A406&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=1%3A406" id="Link">
    		FIGMA Prototype - InfoGraficeTM</a> 
            """
    st.markdown(Link_Figma, unsafe_allow_html=True)
    choropleth1 = folium.Choropleth(
        geo_data='map.geojson',
        data=df_final,
        columns=['ApartmentZone', choice_selected1],
        key_on='feature.properties.text',
        fill_color='Greys',
        nan_fill_color="black",
        line_color='White',
        fill_opacity=0.7,
        line_opacity=0.2
    ).geojson.add_to(m)

style_function = lambda x: {'fillColor': color,
                            'color': '#ffffff',
                            'fillOpacity': 0.5,
                            'weight': 0.8}
highlight_function = lambda x: {'fillColor': color,
                                'color': '#ffffff',
                                'fillOpacity': 0.85,
                                'weight': 0.1}

NIL = folium.features.GeoJson(
    df_final,
    style_function=style_function,
    control=False,
    highlight_function=highlight_function,
    tooltip=folium.features.GeoJsonTooltip(
        fields=['ApartmentZone', choice_selected1],
        aliases=['Region Name: ', choice_selected1],
        style=("background-color: white; color: #333333; font-family: arial; font-size: 13.5px; padding: 10px;")
    )
)
m.add_child(NIL)
m.keep_in_front(NIL)
folium.LayerControl().add_to(m)

with col3:
    folium_static(m, width=500, height=400)

if choice_selected2 == '1 Room' or choice_selected2 == '2 Rooms':
    fig = px.scatter_3d(
        df_final,
        x=choice_selected1,
        y="ApartmentZone",
        z=choice_selected1,
        hover_name="ApartmentZone",
        size=choice_selected1,
        size_max=40,
        color=[color, color, color, color, color, color, color, color, color, color, color],
        color_discrete_map="identity",
        template="plotly_dark")

else:
    fig = px.scatter_3d(
        df_final,
        x=choice_selected1,
        y="ApartmentZone",
        z=choice_selected1,
        hover_name="ApartmentZone",
        size=choice_selected1,
        size_max=40,
        color=[color, color, color, color, color, color, color, color, color, color],
        color_discrete_map="identity",
        template="plotly_dark")

fig.update_layout(
    scene={
        'camera_eye': {"x": 2, "y": 0.6, "z": 1},
        "aspectratio": {"x": 1, "y": 1.5, "z": 0.75}
    },
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    autosize=True,
    margin=dict(l=0, r=0, t=0, b=0)
)