<template>
  <div>
    <TitlePage page='Home'/>
  </div>

  <div class="content">
    <div class="robot_control">
      <h3>Robot Control</h3>
      <div class="enable">
        <label> Robot motion: </label>
        <button @click="publish_string('/topic_UI2',{msg})">Enable</button>
        <button @click="publish_string('/topic_UI2',{msg})">Disable</button>
      </div>
      <div class="radiobuttons">
        <input type="radio" v-model="control_opt" value="0">Process control
        <input type="radio" v-model="control_opt" value="1">Manual control
      </div>
    </div>

    <div class="container">
    <div class="left_content">
    <div class="robot_control_boxes">
    <div class="process" v-if="control_opt==0">
      <h3>Process control</h3>

      <div class="controls">
        <button @click="publish_string('/topic_UI2',{msg})">Run</button>
        <button @click="publish_string_constant('/UI/mode','Idle')">Stop</button>
        <button @click="publish_string_constant('/UI/mode','Running')">{{pause_resume}}</button>
        <button @click="publish_string('/topic_UI2',{msg})">Run step</button>
      </div>

      <div class="operations">
        <label>Operations: </label>
        <select v-model="op_selected">
          <!-- <option disabled value="">Please Select</option> -->
          <option v-for="(op, index) in operation_list" :key="index" :value="index">{{op}}</option>
        </select>
      </div>
    </div>

    <div class="manual" v-else>
      <h3>Move robot</h3>
      <div class="radiobuttons">
        <input type="radio" v-model="manual_opt" value="0">Predefined config
        <input type="radio" v-model="manual_opt" value="1">Cartesian relative
        <input type="radio" v-model="manual_opt" value="2">Cartesian absolute
      </div>

      <div class="predefined" v-if="manual_opt==0">
          <label>Group: </label>
          <select v-model="group_selected">
            <option disabled value="">Please Select</option>
            <option v-for="(group, index) in robot_groups" :key="index" :value="index">{{index}}</option>
          </select>
          <label>Tool: </label>
          <select v-model="config_selected">
            <option disabled value="">Please Select</option>
            <option v-for="(config, index) in robot_groups[group_selected]" :key="index" :value="config">{{config}}</option>
          </select>
        <button class="medium_button" @click="publish_string('/topic_UI2',{msg})">Move</button>
      </div>

      <div class="cartesian relative" v-if="manual_opt==1">
        <div class="inline_items">
          <label class="arm_side"><b>Right</b></label>
          <div v-for="(value, axis) in cartesian_position_rel_right" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_rel_right[axis]">
          </div>
          <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Reset</button>
        </div>
        <div class="inline_items">
          <label class="arm_side"><b>Left</b></label>
          <div v-for="(value, axis) in cartesian_position_rel_left" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_rel_left[axis]">
          </div>
          <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Reset</button>
        </div>
        <button class="medium_button" @click="publish_string('/topic_UI2',{msg})">Move</button>
      </div>

      <div class="cartesian absolute" v-if="manual_opt==2">
        <div class="inline_items">
          <label class="arm_side"><b>Right</b></label>
          <div v-for="(value, axis) in cartesian_position_abs_right" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_abs_right[axis]">
          </div>
          <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Current</button>
        </div>
        <div class="inline_items">
          <label class="arm_side"><b>Left</b></label>
          <div v-for="(value, axis) in cartesian_position_abs_left" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_abs_left[axis]">
          </div>
          <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Current</button>
        </div>
        <button class="medium_button" @click="publish_string('/topic_UI2',{msg})">Move</button>
      </div>

      <div class="EEF_bkg">
      <div class="EEF">
        <h3>Actuate end effector</h3>
        <div v-for="(value, arm) in arm_tools" :key="arm">
        <div class="inline_items">
          <label class="EEF_side"><b>{{arm}}:</b></label>
          <div v-if="value.includes('gripper')">
            <label> gripper</label>
            <input type="text" v-model="tools[value]['distance']">
            <label class="unit">mm</label>
            <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Move</button>
            <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Open</button>
            <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Close</button>
          </div>
          <div v-else-if="value.includes('taping_gun')">
            <label> taping gun</label>
            <button class="small_button" @click="publish_string('/topic_UI2',{msg})">Tape</button>
          </div>
          <div v-else>
            <label> none</label>
          </div>
        </div>
        </div>
      </div>
      </div>

      <div class="ATC">
        <h3>Automatic Tool Changing</h3>
        <label>Robotic arm: </label>
        <select v-model="arm_selected">
          <!-- <option disabled value="">Please Select</option> -->
          <option v-for="(arm, index) in ATC_robots" :key="index" :value="arm">{{arm}}</option>
        </select>
        <label>Tool: </label>
        <select v-model="tool_selected">
          <!-- <option disabled value="">Please Select</option> -->
          <option v-for="(tool, index) in ATC_tools" :key="index" :value="tool">{{tool}}</option>
        </select>
        <button class="medium_button" @click="publish_string('/topic_UI2',{msg})">Change</button>
      </div>

    </div>
    </div>

    <div class="video_area">
      <div class="tab-pane active" id="left_tab1">
        <!-- <img id="left_stream1" class="video" style='height: 30%; width: 30%; object-fit: contain' src="../assets/img/placeholder.png"> -->
        <img v-if="show_stream" id="left_stream1" class="video" style='height: 240px; width: 425px; object-fit: contain' :src=rviz_image>
        <img v-else id="left_stream1" class="video" style='height: 240px; width: 425px; object-fit: contain' src="../assets/img/placeholder.png">
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
    <div class="right_content">
      <div class="feedback">
        <h3>Feedback</h3>
      <ul>
        <il>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea tempore iusto autem nam ab ullam ratione, cupiditate sint fuga enim quas! Repellat, fugiat perspiciatis! Ut nostrum iste distinctio quo eius!</il>
        <il>Mollitia, ea deleniti? Pariatur tempora maxime voluptatibus corrupti reiciendis temporibus quas illum nostrum doloribus, veritatis excepturi obcaecati quasi omnis deleniti fugiat, labore repudiandae sit velit molestias harum ut unde ex.</il>
      </ul>
      </div>
      <div class="logs">
        <h3>Logs</h3>
      <div class="messages">
      <ul>
        <il>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea tempore iusto autem nam ab ullam ratione, cupiditate sint fuga enim quas! Repellat, fugiat perspiciatis! Ut nostrum iste distinctio quo eius!</il>
        <il>Harum odio debitis sit minus temporibus beatae, velit quo reiciendis quas ad corrupti amet earum distinctio hic natus, ratione est, placeat aspernatur qui? Possimus ratione soluta eum suscipit distinctio expedita?</il>
      </ul>
      </div>
      </div>
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
      get_arms_pose_service: null,
      get_moveit_groups_service: null,
      move_group_service: null,
      rviz_image1_topic: null,
      rviz_image2_topic: null,
      rviz_image: "",
      rviz_image2: "../assets/img/placeholder.png",
      camera_list: {RVIZ_Front: "/camera1/image/compressed", RVIZ_Side: "/camera2/image/compressed"},
      camera_selected: "/camera1/image/compressed",
      show_stream: false,
      last_time: 0,
      pause_resume: 'Pause',
      operation_list: ['Pick wiring harness', 'Insert connector', 'Route cables', 'Tape'],
      op_selected: 0,
      ATC_robots: ['right', 'left'],
      ATC_tools: ['taping_gun', 'gripper'],
      tools: {gripper_right:{distance:0}, gripper_right:{distance:0}, taping_gun:''},
      arm_tools: {right: 'gripper_right', left: 'taping_gun'},
      arm_selected: 'left',
      tool_selected: 'gripper',
      robot_groups: {}, /*{arm_right:['pose1', 'pose2'], arm_left:['poseX','poseY']},*/ //Get with a service
      group_selected: '',
      //group_configs: [], //Get with a service
      config_selected: '',
      control_opt: 1,
      manual_opt: 0,
      cartesian_position_rel_right: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      cartesian_position_rel_left: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      cartesian_position_abs_right: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      cartesian_position_abs_left: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
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

    init_services(){
        this.get_arms_pose_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/get_arms_pose',
            serviceType : 'test_pkg/ArmsPose'
        });
        this.get_moveit_groups_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/get_moveit_groups',
            serviceType : 'test_pkg/MoveitGroups'
        });
        this.move_group_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/move_group',
            serviceType : 'test_pkg/MoveGroupSrv'
        });
    },

    update_variables(){
      this.robot_groups={}
      var request = new ROSLIB.ServiceRequest({});
  
      this.get_moveit_groups_service.callService(request, (result) => {
        for (const [key, value] of Object.entries(result.groups)) {
          //groups_temp = {}
          this.robot_groups[value.group] =  []
          for (let i = 0; i < value.targets.length; i++) {
            this.robot_groups[value.group].push(value.targets[i])
          }
        }
      });
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
      this.init_services()
      this.update_variables()
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

<style scoped>

.content{
  position: relative;
  margin: 20px;
  z-index: 200;
}
.container{
  margin: auto;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: fit-content;
}
.left_content{
  width: fit-content;
  display: inline-block;
  float: left;
  /* left: 29%; */
  margin-right: 100px;
}
.right_content{
  width: 350px;
  display: inline-block;
  float: left;
  /* left: 29%; */
}
.video_area{
  /* margin: 40px 10% 20px 20px; */
  text-align: center;
  align-items: center;
  justify-content: center;
}
.video{
  border: 2px solid #1d1b31;
  margin-top: 30px;
}
.camera_selection{
  margin: 10px;
}
select{
  padding:1px;
  padding-left:5px;
  padding-right: 5px;
  border: 1px solid #1d1b31;
  border-radius: 5px;
}
.robot_control_boxes{
  background-color: #49485e;
  width: fit-content;
  border-radius: 15px;
  border: 2px solid #1d1b31;
  color:white;
  padding: 10px 0px 10px 0px;
}
.process *{
  text-align: center;
  margin-top:5px;
  margin-bottom: 10px;
}
/* .process h3{
  padding-top:10px;
} */
.process .controls{
  margin-right: 15px;
  margin-left: 15px;
  margin-bottom: 15px;
}
button{
  border: 1px solid #1d1b31;
  border-radius: 5px;
}
.process .controls button{
  width: 90px;
  height: 25px;
  margin: 5px;
}
.robot_control{
  background: #b0afc4;
  border: 3px solid #716f8c;
  /* text-align: left; */
  width: fit-content;
  /* margin: 40px 10% 20px 20px; */
  margin: auto;
  margin-bottom: 30px;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 7px;
}
.robot_control h3{
  padding: 2px;
}
.robot_control *{
  margin-top: 5px 
}
.robot_control .enable *{
  margin: 5px;
  padding: 3px;
}
.robot_control .enable button{
  /* margin-left: 8px; */
  margin-right: 8px;
  padding: 3px;
  width: 90px;
  height: 30px;
}
.radiobuttons{
  padding: 5px;
  margin-right: 15px;
}
.radiobuttons *{
  margin-right: 5px;
  margin-left: 15px;
}
.cartesian *{
  font-size: 14px;
}
.inline_items *{
  display: inline-block;
}

.cartesian .inline_items *{
  justify-content: right;
  text-align: right;
  /* align-items: right; */
}
.cartesian .inline_items{
  justify-content: right;
  text-align: right;
  /* align-items: right; */
}
/* .manual{
  justify-content: center;
  text-align: center;
  align-items: center;
} */
.cartesian{
  width: fit-content;
  margin: auto;
  margin-top: 8px;
  margin-bottom: 10px;
}
.cartesian .arm_side{
  margin-right: 10px;
}
.cartesian input{
  width: 40px;
  margin-left: 4px;
  margin-right: 6px;
}
.small_button{
  padding: 1px 3px 1px 3px;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 4px;
}
.medium_button{
  padding: 5px 10px 5px 10px;
  margin: 7px;
}
select{
  padding: 2px 5px 2px 5px;
  margin: 0px 10px 0px 3px;
}
.predefined{
  margin: 0px 0px 8px 0px;
}
.EEF_bkg{
  background: #716f8c;
  padding-top: 5px;
  padding-bottom: 5px;
}
.EEF{
  width: fit-content;
  margin: auto;
  margin-bottom: 8px;

}
.EEF input{
  width: 40px;
}
input{
  text-align: right;
  border: 1px solid #1d1b31;
  border-radius: 3px;
  padding-right: 1px; 
}
.unit{
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  padding-right: 8px;
}
.EEF .inline_items{
  justify-content: left;
  text-align: left;
  /* align-items: right; */
}
.EEF .inline_items *{
  margin: 3px 5px 3px 0px;
}
.EEF_side{
  width: 60px;
  text-align: right;
}
.ATC{
  padding-top: 7px;
}
.feedback{
  background: #1d1b31;
  margin-bottom: 20px;
  color: white;
  border-radius: 8px;
  padding: 5px;
}
.logs{
  background: #1d1b31;
  border: 5px solid #1d1b31;
  color: white;
  border-radius: 8px;
  padding: 5px;
  padding-bottom: 8px;
}
.logs .messages{
  height: 220px;
  overflow: scroll;
  background: #716f8c;
  color: #1d1b31;
  margin-top: 8px;
  border-radius: 5px;
  padding: 5px;
  display:flex; 
  flex-direction:column-reverse;
}
option{
  padding-right: 2px;
}
</style>