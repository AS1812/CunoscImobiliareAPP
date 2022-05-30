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

		.content {
		  position: fixed;
		  bottom: 0;
		  background: rgba(0, 0, 0, 0.5);
		  color: #f1f1f1;
		  width: 100%;
		  padding: 20px;
		}

		</style>	
		<video autoplay muted loop id="myVideo">
		  <source src="https://dl.dropbox.com/s/le1r7z0v1ho7g0b/Timisoara.avi?dl=0">
		  Your browser does not support HTML5 video.
		</video>
        """

st.markdown(video_html, unsafe_allow_html=True)

st.markdown("<a href='https://share.streamlit.io/as1812/proiectdiploma/StreamlitPg2.py' style='font-family:courier; font-size:300%; text-decoration:none; color: white; position: absolute; top: 750px; right: 0pt;'>Click pentru hartă & mai multe</a>", unsafe_allow_html=True)

