<template>
    <div>
      <TitlePage page='Home'/>
    </div>
    <!-- <h1>Home page</h1> -->
    <div class="content">
    <button @click="publish_string('/topic_UI2',{msg})">Publish</button>
    <button @click="publish_string_constant('/UI/mode','Idle')">Idle mode</button>
    <button @click="publish_string_constant('/UI/mode','Running')">Running mode</button>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui dicta minus molestiae vel beatae natus eveniet ratione temporibus aperiam harum alias officiis assumenda officia quibusdam deleniti eos cupiditate dolore doloribus!</p>
    <p>Ad dolore dignissimos asperiores dicta facere optio quod commodi nam tempore recusandae. Rerum sed nulla eum vero expedita ex delectus voluptates rem at neque quos facere sequi unde optio aliquam!</p>
    <p>Tenetur quod quidem in voluptatem corporis dolorum dicta sit pariatur porro quaerat autem ipsam odit quam beatae tempora quibusdam illum! Modi velit odio nam nulla unde amet odit pariatur at!</p>
    <p>Consequatur rerum amet fuga expedita sunt et tempora saepe? Iusto nihil explicabo perferendis quos provident delectus ducimus necessitatibus reiciendis optio tempora unde earum doloremque commodi laudantium ad nulla vel odio?</p>
  </div>
</template>

<script>
import VueSidebarMenuAkahon from '@/components/Sidebar-menu-akahon.vue';
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Home',

  components: {TitlePage},

  data(){
    return{
      msg: 'Hellooo',
      rosCon: false,
      modeProp: '',
      menuOpen: true,
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

    test_method(){
      console.log("Hello test")
    },
  },

  mounted(){
    this.ros = new ROSLIB.Ros({
      url : 'ws://192.168.43.168:9090' //Port = 9090
    });
    console.log(this.ros)
    
    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.rosCon = true
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })

    this.modeProp = 'Running';
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