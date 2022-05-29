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
		  <source src="https://rr4---sn-4g5e6nss.googlevideo.com/videoplayback?expire=1653875987&ei=s9CTYtzLN6mC6dsP7LOU0Ak&ip=212.102.57.213&id=o-ADBUwiJZSW73d4EHRBECxSWBFNBCEZIrHWwaYAJmTs2v&itag=137&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278&source=youtube&requiressl=yes&spc=4ocVC73D6VIjtxV3NiZEXlcYXNvG&vprv=1&mime=video%2Fmp4&ns=3tAr2YOgIKQ7500SICUukAcG&gir=yes&clen=6275545&otfp=1&dur=19.400&lmt=1653685114046933&keepalive=yes&fexp=24001373,24007246&c=WEB_EMBEDDED_PLAYER&txp=6216224&n=PmeAyJBS3IEUrw&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cotfp%2Cdur%2Clmt&sig=AOq0QJ8wRQIgBXlGKyrP7u4_t0RFTh6LkHk8PE7Sy7ILTmxFS3zh7HECIQC5b4arLnQXU_Bn6-1zsX7XA0JV3HbO1du_Wk7DuoLo3A%3D%3D&rm=sn-n02xgoxufvg3-2gbs7d,sn-4g5ezl7z&req_id=d080575d2c4ba3ee&redirect_counter=2&cms_redirect=yes&cmsv=e&ipbypass=yes&mh=sd&mip=92.114.82.174&mm=29&mn=sn-4g5e6nss&ms=rdu&mt=1653854225&mv=m&mvi=4&pl=25&lsparams=ipbypass,mh,mip,mm,mn,ms,mv,mvi,pl&lsig=AG3C_xAwRQIgOhgWzN-D2wUK03GHlSwQr7OeBTVqq2sS4PQwXc_fGJECIQDiH3LU2_iaRapY0LKtbBYm3miQ9ZdDLFGSeZSdmNEkAA%3D%3D">
		  Your browser does not support HTML5 video.
		</video>
        """

st.markdown(video_html, unsafe_allow_html=True)

st.markdown("<a href='https://share.streamlit.io/as1812/proiectdiploma/StreamlitPg2.py' style='font-family:courier; font-size:300%; text-decoration:none; color: white; position: absolute; top: 750px; right: 0pt;'>Click pentru hartă & mai multe</a>", unsafe_allow_html=True)

