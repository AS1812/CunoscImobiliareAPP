import pandas as pd
import streamlit as st
from streamlit_folium import folium_static
import folium
import geopandas as gpd
import plotly.express as px
from st_aggrid import AgGrid

st.set_page_config(layout="wide")
fname = 'map.geojson'
nil = gpd.read_file(fname)

m = folium.Map(location=[45.752, 21.22], zoom_start=13, tiles="CartoDB dark_matter",
               name='Statistici imobiliare Timișoara',
               attr="My Data attribution")

col1, col2 = st.columns((1.4, 4))
with col1:
    choice = ['PretMediu', 'PretMinim', 'PretMaxim', 'PretMetru', 'NumarAnunturi']

    choice_selected = st.selectbox("Alegeți o opțiune pentru a fi reprezentată", choice,
                                   help='Alegerea selectată urmează să fie '
                                        'reprezentată pe hartă, în fiecare regiune.'
                                        'Spre exemplu, daca alegerea făcută indică'
                                        '"PretMediu", prețul mediu va fi afișat în'
                                        'fiecare regiune, alături de numele acesteia,'
                                        'totodată facându-se și o departajare în '
                                        'funcție de culoare.')
    color = st.color_picker('Alegeți o culoare pentru a evdenția zonele', '#0036ff')
    st.write('Culoarea curentă este: ', color)


df = pd.read_csv('sql_query.csv')
fname = 'map.geojson'
nil = gpd.read_file(fname)
nil = nil[['id', 'geometry']]
df_final = nil.merge(df, left_on="id", right_on="id", how="outer")
df_final.rename(columns={'text': 'NumeZonă'}, inplace=True)

with col1:
    st.markdown(f"""
    <style>
    .paragraf {{
        font-family: Helvetica;
        font-size: 20px;
        color:{color};
    }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<p class="paragraf">Tabel cu zonele și cu opțiunea selectată</p>', unsafe_allow_html=True )

    grid_response = AgGrid(
        df_final[['NumeZonă', choice_selected]],
        data_return_mode='AS_INPUT',
        update_mode='MODEL_CHANGED',
        fit_columns_on_grid_load=True,
        height=360,
        width='100%',
        reload_data=True,
        theme='dark'
    )

    st.markdown(f""" """, unsafe_allow_html=True)


choropleth1 = folium.Choropleth(
    geo_data='map.geojson',
    data=df_final,
    columns=['id', choice_selected],
    key_on='feature.properties.id',
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
        fields=['NumeZonă', choice_selected],
        aliases=['Nume Regiune: ', 'Reprezentare alegere '],
        style=("background-color: white; color: #333333; font-family: arial; font-size: 13.5px; padding: 10px;")
    )
)
m.add_child(NIL)
m.keep_in_front(NIL)
folium.LayerControl().add_to(m)
with col2:
    folium_static(m, width=1350, height=660)

fig = px.scatter_3d(
    df_final,
    x=choice_selected,
    y="NumeZonă",
    z=choice_selected,
    hover_name="NumeZonă",
    size=choice_selected,
    size_max=60,
    color=[color, color, color, color, color, color, color, color, color, color, color],
    color_discrete_map="identity")

fig.update_layout(title="Reprezentare 3d a opțiunii selectate", paper_bgcolor='#030312')
fig.update_layout(
    scene={
        'camera_eye': {"x": 2, "y": 0.6, "z": 1},
        "aspectratio": {"x": 1, "y": 1.5, "z": 0.75}

    },

    width=1350,
    height=700)
fig.update_layout(
    scene=dict(
        xaxis=dict(
            backgroundcolor="rgba(0, 0, 0,0)",
            gridcolor=color,
            showbackground=True,
            zerolinecolor="white", ),
        yaxis=dict(
            backgroundcolor="rgba(0, 0, 0,0)",
            gridcolor=color,
            showbackground=True,
            zerolinecolor="white"),
        zaxis=dict(
            backgroundcolor="rgba(0, 0, 0,0)",
            gridcolor=color,
            showbackground=True,
            zerolinecolor="white", ), ),
)
with col2:
    st.plotly_chart(fig, use_container_width=True)

fig2 = px.bar_polar(df_final, r=choice_selected, theta="NumeZonă",
                    color=[color, color, color, color, color, color, color, color, color, color, color],
                    color_discrete_map="identity"
                    )
fig2.update_layout(
    scene=dict(
        xaxis=dict(
            backgroundcolor="rgba(0, 0, 0,0)",
            gridcolor=color,
            showbackground=True,
            zerolinecolor="white"),
        yaxis=dict(
            backgroundcolor="rgba(0, 0, 0,0)",
            gridcolor=color,
            showbackground=True,
            zerolinecolor="white"), ),
)
with col1:
    st.plotly_chart(fig2, use_container_width=True)


