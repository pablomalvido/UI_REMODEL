<template>
  <div>
    <TitlePage page='Sensors'/>
  </div>
  <div class="content">
    <button @click="publish_string('/topic_UI2',{msg})">Publish</button>
    <button @click="publish_string_constant('/UI/mode','Idle')">Idle mode</button>
    <button @click="publish_string_constant('/UI/mode','Running')">Running mode</button>
  <p>We and our partners use cookies to Store and/or access information on a device. We and our partners use data for Personalised ads and content, ad and content measurement, audience insights and product development. An example of data being processed may be a unique identifier stored in a cookie. Some of our partners may process your data as a part of their legitimate business interest without asking for consent. To view the purposes they believe they have legitimate interest for, or to object to this data processing use the vendor list link below. The consent submitted will only be used for data processing originating from this website. If you would like to change your settings or withdraw consent at any time, the link to do so is in our privacy policy accessible from our home page..</p>
  <label for="fname">User name:</label>
  <input type="text" v-model="username"><br><br>
  <label for="lname">Password:</label>
  <input type="password" v-model="password"><br><br>
  <button @click="create_user()">Create user</button>
  <p>The role is: {{role}}</p>
  </div>
</template>

<script>
import ROSLIB from "roslib";
import TitlePage from '@/components/Title_page.vue';
const CryptoJS = require("crypto-js");

export default {
  name: 'Sensors',

  components: {TitlePage},
  
  data(){
    return{
      msg: 'Hellooo',
      rosCon: false,
      modeProp: '',
      username: '',
      password: '',
      role: this.$route.params.role
    }
  },

  methods: {
    publish_string(topic, message){
      var loadPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic,
        messageType : 'std_msgs/String'
      });

      var loadTopic = new ROSLIB.Message({
        data: message['msg']
      });

      loadPublisher.publish(loadTopic);
    },

    publish_string_constant(topic, message){
      var loadPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic,
        messageType : 'std_msgs/String'
      });

      var loadTopic = new ROSLIB.Message({
          data: message
      });

      loadPublisher.publish(loadTopic);
    },
    
    create_user(){
      var encrypted = CryptoJS.AES.encrypt(this.password, this.password);
      var decrypted = CryptoJS.AES.decrypt(encrypted, this.password);
      var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      console.log(this.username)
      console.log(encrypted.toString());
      console.log(plaintext)
    }
  },

  mounted(){
    this.url = 'ws://' + (((window.location.href).split("/")[2]).split(":")[0]) + ':9090';
    this.ros = new ROSLIB.Ros({
        url : this.url //'ws://192.168.43.168:9090'
    });
    console.log(this.ros)
    
    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.rosCon = true
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
      throw "Not connected";
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })

    this.modeProp = 'Idle';
  },

  unmounted(){
    this.ros.close()
  }
}
</script>

<style>
.content{
  position: relative;
  margin: 20px;
  z-index: 200;
}
</style>