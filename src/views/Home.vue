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
    <div class="video_area">
      <div class="tab-pane active" id="left_tab1">
        <!-- <img id="left_stream1" class="video" style='height: 30%; width: 30%; object-fit: contain' src="../assets/img/placeholder.png"> -->
        <img v-if="show_stream" id="left_stream1" class="video" style='height: 30%; width: 30%; object-fit: contain' :src=rviz_image>
        <img v-else id="left_stream1" class="video" style='height: 30%; width: 30%; object-fit: contain' src="../assets/img/placeholder.png">
      </div>
      <!-- <input type="radio" v-model="camera_selected" value="/camera1/image/compressed">Front camera
      <input type="radio" v-model="camera_selected" value="/camera2/image/compressed">Side camera -->
      <div class="camera_selection">
        <label>Camera view: </label>
        <select v-model="camera_selected">
          <option disabled value="">Please Select</option>
          <option v-for="(topic, name) in camera_list" :key="name" :value="topic">{{name}}</option>
        </select>
      </div>
    </div>
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
      rviz_image1_topic: null,
      rviz_image2_topic: null,
      rviz_image: "",
      rviz_image2: "../assets/img/placeholder.png",
      camera_list: {Front: "/camera1/image/compressed", Side: "/camera2/image/compressed"},
      camera_selected: "/camera1/image/compressed",
      show_stream: false,
      last_time: 0,
    }
  },

  methods: {
    init_subscribers(){
      this.rviz_image1_topic = new ROSLIB.Topic({
        ros : this.ros,
        name : '/camera1/image/compressed',
        messageType : 'sensor_msgs/CompressedImage'
      });
      
      this.rviz_image1_topic.subscribe((message) => {
        //console.log('RVIZ image 1 updated');
        if (this.rviz_image1_topic.name == this.camera_selected){
          this.last_time = Date.now();
          this.rviz_image = "data:image/jpg;base64," + message.data;
        }
      });

      this.rviz_image2_topic = new ROSLIB.Topic({
        ros : this.ros,
        name : '/camera2/image/compressed',
        messageType : 'sensor_msgs/CompressedImage'
      });
      
      this.rviz_image2_topic.subscribe((message) => {
        //console.log('RVIZ image 2 updated');
        if (this.rviz_image2_topic.name == this.camera_selected){
          this.last_time = Date.now();
          this.rviz_image = "data:image/jpg;base64," + message.data;
        }
      });
    },

    stop_subscribers(){
      if (this.rviz_image1_topic){
        this.rviz_image1_topic.unsubscribe();
      }
    },

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

    checkStreamState(){
      if ((Date.now()-this.last_time)<1000){
        this.show_stream = true;
      }
      else{
        this.show_stream = false;
      }
      setTimeout(() => { //Check periodically
        this.checkStreamState() 
      }, 1000)
    },

    test_method(){
      console.log("Hello test")
      this.ros.getServices((services) => {
        console.log(services);
      });
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
      this.init_subscribers()
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })

    this.checkStreamState()
    this.test_method()
  },

  unmounted(){
    this.stop_subscribers()
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
.video_area{
  margin: 40px 10% 20px 20px;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.video{
  border: 2px solid #1d1b31;
  margin: 10px;
}
.camera_selection{
  margin: 10px;
}
</style>