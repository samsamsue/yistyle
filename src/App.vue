<script>
import { computed } from 'vue';

export default {
  data() {
    return {
      darkMode: localStorage.getItem('yiuios-darkmode-cache') == 'true' ? true : false,
      loading:false,
      auth:{
        username:'',
        password:'',
      },
      address:'',
      result:{},
      videoInited:false,
      log:false,
      videoBgVisible:localStorage.getItem('yiuios-loginpage-videobgvisible') == 'true' ? true : false,
      videoReady:false,
      videoList:[
				'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-girl-working-on-a-computer-4938-large.mp4',
				'https://assets.mixkit.co/videos/preview/mixkit-office-workers-hands-typing-on-their-devices-4835-large.mp4',
				'https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-big-city-near-skyscrapers-27261-large.mp4',
				'https://assets.mixkit.co/videos/preview/mixkit-very-close-shot-of-the-leaves-of-a-tree-wet-18310-large.mp4',
				'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-seen-up-18312-large.mp4',
				'https://assets.mixkit.co/videos/preview/mixkit-abundant-trees-in-a-jungle-5039-large.mp4',
			]
    }
  },
  mounted() {
    this.toggleDarkMode();
    this.videoBgVisible && this.initVideoBg();
    this.getAddress();
  },
  methods: {
    initVideoBg(){
      if(this.videoInited) return;
      this.videoInited = true;
      let video = this.$refs.videoBg;
      let index = Math.floor(Math.random() * this.videoList.length);
      video.src = this.videoList[index];

      let canplayEvent = ()=>{
        this.videoReady = true;
        video.removeEventListener('canplay', canplayEvent);
      }
			video.addEventListener('canplay',canplayEvent);
    },
    toggleDarkMode() {
      let doc = document.querySelector('html');
      doc.classList.toggle('dark', this.darkMode);
      localStorage.setItem('yiuios-darkmode-cache', this.darkMode);
    },
    login(){
      this.loading = true;
      this.log = false;
      fetch(admin_path + 'loginAuth',{
        method:'post',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(this.auth),
      }).catch(()=>{
        this.result = {};
      }).then(res=>res.json()).then(json=>{
        this.result = json;
        if(json.status == 1 && json.data.redirect){
          location.replace(json.data.redirect);
        }
      }).finally(()=>{
        this.log = true;
        this.loading = false;
      });
    },
    input(){
      this.log =false;
    },
    getAddress(){
      this.$plus.jsonp('//api.map.baidu.com/location/ip?ak=aXQnsV5Rao9ScaGA0pHX1CjgvADhFSt5').then(json=>{
        let r = json.content;
        this.address = r ? r.address : '-';
      });
    },
  },
  watch: {
    darkMode(val) {
      this.toggleDarkMode();
    },
    videoBgVisible(val){
      localStorage.setItem('yiuios-loginpage-videobgvisible',val);
      if(val) this.initVideoBg();
    }
  }

}
</script>

<template>
  <div style="width:100%;height:100%;position:fixed;left:0;top:0;">
    <div class="full-absolute" v-if="!videoReady || !videoBgVisible" style="background-image: url(https://yiuios.com/__admin__/index/bingImage);background-size: cover;background-position: center;opacity:0.5;"></div>
    <div class="full-absolute" v-show="videoReady && videoBgVisible">
      <video ref="videoBg" autoplay muted loop class="full" src="" style="object-fit: cover;opacity: 0.5;"></video>
    </div>
    <div class="full-absolute" :class="{'error-glow':log&&result.status!=1}"></div>
    <el-space style="display:inline-flex;align-items:center;margin:20px;color:#FFF;position: relative;font-size: 12px;background-color: rgba(0,0,0,0.5);backdrop-filter: blur(10px);  padding: 3px 10px;line-height: 1; border-radius:20px;">
      <div>视频背景</div> 
      <el-switch v-model="videoBgVisible" size="small"></el-switch> 
      <el-icon class="is-loading" v-if="!videoReady && videoBgVisible"><Loading /></el-icon>
    </el-space>
  </div>

  <div style="z-index:1;position:relative;background-color: var(--el-color-white);min-width:560px;border-radius:6px;">
    <div style="padding:20px;display:flex;align-items:center;border-bottom:1px solid var(--color-border);">
      <div style="font-size:20px;">后台系统登录</div>
      <div style="margin-left:auto;font-size:14px;">
        <el-icon style="vertical-align: middle;"><Location /></el-icon>
        {{address}}
      </div>
    </div>
    <div style="padding:40px 40px;display:flex;">
      <div style="flex:0 0 33%;text-align:center;margin-right: 40px;">
        <svg style="max-width:100%;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          fill="none" version="1.1" width="118" height="138" viewBox="0 0 118 138">
          <g>
            <path
              d="M98.3333,46L111.444,46C115.065,46,118,48.9421,118,52.5714L118,131.429C118,135.058,115.065,138,111.444,138L6.55556,138C2.93502,138,0,135.058,0,131.429L0,52.5714C0,48.9421,2.93502,46,6.55556,46L19.6667,46L19.6667,39.4286C19.6667,17.6528,37.2768,0,59,0C80.7232,0,98.3333,17.6528,98.3333,39.4286L98.3333,46ZM52.4444,96.8103L52.4444,111.714L65.5556,111.714L65.5556,96.8103C72.6152,92.7245,74.2835,83.2399,69.0437,76.9802C63.8039,70.7205,54.1962,70.7205,48.9563,76.9802C43.7165,83.2399,45.3848,92.7245,52.4444,96.8103ZM85.2222,46L85.2222,39.4286C85.2222,24.9114,73.4821,13.1429,59,13.1429C44.5179,13.1429,32.7778,24.9114,32.7778,39.4286L32.7778,46L85.2222,46Z"
              fill="#C2C2C2" fill-opacity="0.10000000149011612" />
          </g>
        </svg>
      </div>
      <div style="flex:auto;width:1px;">
        <el-input @input="input" @keydown.enter="login" v-model="auth.username" type="text" size="large" placeholder="请输入账号" />
        <el-input @input="input" @keydown.enter="login" v-model="auth.password" class="input" size="large" show-password style="margin-top:20px;" type="password" placeholder="请输入密码" />
        <Transition name="slide-fade">
          <el-alert v-if="log" style="margin-top: 10px;" :title="result.info||'网络或程序出错'" :type="result.status == 1? 'success' : 'error'" :closable="false" />
        </Transition>
        
        <el-button @click="login" type="primary" :loading="loading" icon="Unlock" size="large" style="width:100%;margin-top:20px;">确定登录</el-button>
      </div>
    </div>
    <div
      style="padding:20px;border-top:1px solid var(--color-border);font-size:12px;color:var(--color-medium);text-align: center;">
      你的IP地址已被记录，如非管理员，勿尝试登录
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  padding: 0;
}

.error-glow{
  animation: glow-red 2s infinite;
}
@keyframes glow-red {
  0%{box-shadow: inset 0 0 0 transparent;}
  50%{box-shadow: inset 0 0 60px #F00;}
  100%{box-shadow: inset 0 0 0 transparent;}
}
</style>
