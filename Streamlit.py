import streamlit as st

st.set_page_config(layout="wide")

video_html = """
		<style>

		#myVideo {
		  position: fixed;
		  right: 0;
		  bottom: 0;
		  min-width: 100%; 
		  min-height: 100%;
		}

		</style>	
		
		<video autoplay muted id="myVideo" width="100%" height="auto">
		  <source src="https://dl.dropbox.com/s/z7eyd6jmvnfajjd/Timisoara_8s.mp4?dl=0">
		</video>
		
        """

redirect = "<meta http-equiv='refresh' content='8; URL=https://share.streamlit.io/as1812/proiectdiploma/StreamlitPg2_dark.py' />"

st.markdown(redirect, unsafe_allow_html=True)
st.markdown(video_html, unsafe_allow_html=True)
