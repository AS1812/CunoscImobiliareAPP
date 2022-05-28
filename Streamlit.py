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
		  <source src="https://rr5---sn-q4fl6ns7.googlevideo.com/videoplayback?expire=1653707286&ei=tj2RYrmfHpKRlu8PucSVyAU&ip=173.245.202.131&id=o-AGppYlTHY9xz1Redp1NoskFAphjnDgTvyRsEJU5wlPDL&itag=137&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278&source=youtube&requiressl=yes&spc=4ocVCxbCFuvX3zR6DEXV2GGk7gys&vprv=1&mime=video%2Fmp4&ns=PZoAH0PU25iTDGxRprC1qaoG&gir=yes&clen=6275545&otfp=1&dur=19.400&lmt=1653685114046933&keepalive=yes&fexp=24001373,24007246&c=WEB_EMBEDDED_PLAYER&txp=6216224&n=ZEE5oiKiuu7OVg&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cotfp%2Cdur%2Clmt&sig=AOq0QJ8wRAIgMaJyLjelSOLyxpZjmgKZmo_mA0u63FdoSSMbE1JE720CICS3pXZ4gw-Oc9zwv28gDtMhLM2K_k1eir2QP-PtvfeC&redirect_counter=1&cm2rm=sn-vgqely7e&req_id=b4047c38cf22a3ee&cms_redirect=yes&cmsv=e&mh=sd&mip=62.231.94.74&mm=34&mn=sn-q4fl6ns7&ms=ltu&mt=1653685575&mv=D&mvi=5&pl=0&lsparams=mh,mip,mm,mn,ms,mv,mvi,pl&lsig=AG3C_xAwRQIgG88dVHJaJ7kIRXLhRPSNdT7zL1ZT0Xd9tuMwBbdmDT8CIQDpBmyNY7Uj--xbsQ4ZJE4jOcBbeFU5NVVRQ6Bt5Vab6w%3D%3D")>
		  Your browser does not support HTML5 video.
		</video>
        """

st.markdown(video_html, unsafe_allow_html=True)

st.markdown("<p style='margin-left:1400px; color: red;'>Paragraf</p>", unsafe_allow_html=True)



st.write("check out this [link](https://share.streamlit.io/as1812/proiectdiploma/StreamlitPg2.py)")