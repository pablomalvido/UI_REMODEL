<template>
    <div class='page_bkg'>
    <div>
      <VueSidebarMenuAkahon page='Home' :rosCon="rosCon" :modeProp="modeProp"/>
    </div>
    <div>
      <router-view/>
    </div>
    </div>
</template>

<script>
import VueSidebarMenuAkahon from '@/components/Sidebar-menu-akahon.vue';
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'App',

  components: {VueSidebarMenuAkahon},

  data(){
    return{
      msg: 'Hellooo',
      rosCon: false,
      modeProp: 'Running',
      menuOpen: true,
      topic_mode: null,
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
        data: Object.values(message)[0]
      });

      loadPublisher.publish(loadTopic);
      console.log(this.rosCon)
    },

    test_method(){
      console.log("Hello test")
    },

    subscribe_topics(){
      //Subscribe to the topic that publishes the mode
      this.topic_mode = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/mode',
        messageType : 'std_msgs/String'
      });
      
      this.topic_mode.subscribe((message) => {
        console.log('Received message on ' + this.topic_mode.name + ': ' + message.data);
        this.modeProp = message.data;
      });
    }
  },

  mounted(){
    this.ros = new ROSLIB.Ros({
      url : 'ws://192.168.43.168:9090' //Port = 9090
    });
    console.log(this.ros)
    
    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.rosCon = true
      this.subscribe_topics()
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })
  },

  unmounted(){
    this.topic_mode.unsubscribe();
    this.ros.close();
  }
}
</script>


<style>
  body {
    background-color: #e2e1ec;
  }
</style>
