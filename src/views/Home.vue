<template>
  <div>
    <TitlePage page='Home'/>
  </div>

  <div class="content">
    <div class="robot_control">
      <h3>Robot Control</h3>
      <h4 v-if="real_robot_con">Robot connected</h4>
      <h4 v-else-if="demo_robot_con">Robot demo connected</h4>
      <h4 v-else>Robot not connected</h4>
      <div class="enable" v-if="real_robot_con">
        <label> Robot motion: </label>
        <button :disabled="robot_enable_status" @click="robot_enable()">Enable</button>
        <button :disabled="!robot_enable_status" @click="robot_disable()">Disable</button>
      </div>
      <div class="radiobuttons" v-if="role_user=='Administrator'">
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
        <button :disabled="modeProp=='Running'" @click="publish_bool('/UI/start',true); paused_bool=false;">Start</button>
        <button :disabled="modeProp=='Idle' && !paused_bool" @click="publish_bool('/UI/stop',true); paused_bool=false;">Stop</button>
        <button :disabled="modeProp=='Running'" v-if="paused_bool" @click="publish_bool('/UI/resume',true); paused_bool=false;">Resume</button>
        <button :disabled="modeProp=='Idle'" v-else @click="publish_bool('/UI/pause',true); paused_bool=true;">Pause</button>
        <button :disabled="modeProp=='Running'" @click="publish_int('/UI/step',op_selected); paused_bool=false;">Run step</button>
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
        <input type="radio" @click="reset_cartesian('both', 2)" v-model="manual_opt" value="2">Cartesian absolute
      </div>

      <div class="predefined" v-if="manual_opt==0">
          <label>Group: </label>
          <select v-model="group_selected" :onchange="update_select_group()">
            <option disabled value="">Please Select</option>
            <option v-for="(group, index) in robot_groups" :key="index" :value="index">{{index}}</option>
          </select>
          <label>Config: </label>
          <select v-model="config_selected">
            <option disabled value="">Please Select</option>
            <option v-for="(config, index) in robot_groups[group_selected]" :key="index" :value="config">{{config}}</option>
          </select>
        <button class="medium_button" :disabled="robot_moving" @click="move_group_manual()">Move</button>
      </div>

      <div class="cartesian relative" v-if="manual_opt==1">
        <div class="inline_items">
          <label class="arm_side"><b>Right</b></label>
          <div v-for="(value, axis) in cartesian_position_rel_right" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_rel_right[axis]">
          </div>
          <button class="small_button" @click="reset_cartesian('right', 1)">Reset</button>
        </div>
        <div class="inline_items">
          <label class="arm_side"><b>Left</b></label>
          <div v-for="(value, axis) in cartesian_position_rel_left" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_rel_left[axis]">
          </div>
          <button class="small_button" @click="reset_cartesian('left', 1)">Reset</button>
        </div>
        <button class="medium_button" :disabled="robot_moving" @click="move_group_manual()">Move</button>
        <div class="small_letter">
          <label><b>(Note 1:</b> Units in mm and degrees.</label>
          <label><b>Note 2:</b> ZYX Euler angles.)</label>
        </div>
      </div>

      <div class="cartesian absolute" v-if="manual_opt==2">
        <div class="inline_items">
          <label class="arm_side"><b>Right</b></label>
          <div v-for="(value, axis) in cartesian_position_abs_right" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_abs_right[axis]">
          </div>
          <button class="small_button" @click="reset_cartesian('right', 2)">Current</button>
        </div>
        <div class="inline_items">
          <label class="arm_side"><b>Left</b></label>
          <div v-for="(value, axis) in cartesian_position_abs_left" :key="axis">
            <label> {{axis}}: </label>
            <input type="text" v-model="cartesian_position_abs_left[axis]">
          </div>
          <button class="small_button" @click="reset_cartesian('left', 2)">Current</button>
        </div>
        <button class="medium_button" :disabled="robot_moving" @click="move_group_manual()">Move</button>
        <div class="small_letter">
          <label><b>(Note 1:</b> Units in mm and degrees.</label>
          <label><b>Note 2:</b> ZYX Euler angles.)</label>
        </div>
      </div>

      <div class="speed_limits">
        <label> Speed limit: </label>
        <input type="text" v-model="speed_limit" :onchange="check_speed_limit()">
        <label> Acceleration limit: </label>
        <input type="text" v-model="accel_limit" :onchange="check_accel_limit()">
      </div>

      <div class="EEF_bkg">
      <div class="EEF">
        <h3>Actuate end effector</h3>
        <div v-for="(value, arm) in arm_tools" :key="arm">
        <div class="inline_items">
          <label class="EEF_side"><b>{{arm}}:</b></label>
          <div v-if="value.includes('gripper')">
            <label> gripper</label>
            <input type="text" v-model="tools[value]['distance']" :onchange="check_gripper_limit(value, 0)">
            <label class="unit">mm</label>
            <button class="small_button" @click="check_gripper_limit(value, gripper_grasp_dist); move_gripper(arm, tools[value]['distance'], 'move')">Move</button>
            <button class="small_button" @click="move_gripper(arm, gripper_open_dist, 'move')">Open</button>
            <button class="small_button" @click="move_gripper(arm, gripper_grasp_dist, 'grasp')">Grasp</button>
          </div>
          <div v-else-if="value.includes('taping_gun')">
            <label> taping gun</label>
            <button class="small_button">Tape</button>
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
        <button class="medium_button">Change</button>
      </div>

    </div>
    </div>

    <div v-if="!visualize_confirmation" class="video_area">
      <div class="tab-pane active" id="left_tab1">
        <!-- <img id="left_stream1" class="video" style='height: 30% 240; width: 30% 425; object-fit: contain' src="../assets/img/placeholder.png"> -->
        <img v-if="show_stream" id="left_stream1" class="video" style='height: 319px; width: 425px; object-fit: contain' :src=rviz_image>
        <img v-else id="left_stream1" class="video" style='height: 319px; width: 425px; object-fit: contain' src="../assets/img/placeholder.png">
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
    <div v-else>
      <div>
        <img class="video" style='height: 319px; width: 425px; object-fit: contain' src="../assets/img/grasp_image.jpg">
      </div>
      <div>
        <label>Grasp point: </label>
        <button class="small_button" @click="confim_response('Y')">Confirm</button>
        <button class="small_button" @click="confim_response('N')">Cancel</button> 
        <button class="small_button" @click="confim_response('R')">Repeat</button> 
      </div>
    </div>
    </div>
    <div class="right_content">
      <div class="feedback">
        <h3>Status</h3>
      <ul class="block_items" v-for="(value, key) in feedback_msgs" :key="key">
        <il>
          <label class="feedback_name inline_items_feedback">{{value.name}}: </label>
          <label class="feedback_value inline_items_feedback">{{value.val}}</label>
        </il>
      </ul>
      </div>
      <div class="logs">
        <h3>Logs</h3>
      <div class="messages">
      <ul v-for="(message_log, key) in logs" :key="key">
        <il>{{message_log}}</il>
      </ul>
      </div>
      </div>
        <div class="record_control">
          <label>Global camera recording: </label>
          <button :disabled="recording||!active_record" @click="publish_bool('/OAK/start_video_recording',true)">Start</button>
          <button :disabled="!recording||!active_record" @click="publish_bool('/OAK/stop_video_recording',true)">Stop</button>
        </div>
        <div v-if="recording && active_record">
          <label class="recording_time">{{recording_time}}</label>
        </div>
    </div>
    </div>
  </div>
</template>

<script>
import ROSLIB from "roslib";
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Home',

  components: {TitlePage},

  data(){
    return{
      rosCon: false,
      modeProp: 'Idle',
      menuOpen: true,
      real_robot_con: false,
      demo_robot_con: false,
      robot_enable_status: false,
      role_user: this.$route.params.role,
      get_arms_pose_service: null,
      get_moveit_groups_service: null,
      move_group_service: null,
      get_all_operations_service: null,
      get_mode_service: null,
      robot_enable_service: null,
      robot_disable_service: null,
      visualize_confirmation: false,
      confirm_pub: null,
      confirm_subs: null,
      index_topic: null,
      topic_mode: null,
      topic_logs: null,
      topic_feedback: null,
      topic_robot_status: null,
      topic_record_time: null,
      rviz_image_topics: [],
      // rviz_image1_topic: null,
      // rviz_image2_topic: null,
      // rviz_image3_topic: null,
      rviz_image: "",
      rviz_image2: "../assets/img/placeholder.png",
      active_record: false,
      recording: false,
      recording_time: "00:00",
      camera_list: {RVIZ_Front: "/camera1/image/compressed", RVIZ_Side: "/camera2/image/compressed", RVIZ_guides: "/camera3/image/compressed", OAK_camera: "/OAK/stream_compressed", Global_camera: "/OAK/stream_compressed_1"},
      camera_selected: "/camera1/image/compressed",
      show_stream: false,
      last_time: 0,
      paused_bool: false,
      operation_list: ['Error loading operations'],//['Pick wiring harness', 'Insert connector', 'Route cables', 'Tape'],
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
      control_opt: 0,
      manual_opt: 0,
      robot_moving: false,
      speed_limit: "0.1",
      accel_limit: "0.1",
      speed_limit_max: 0.2,
      accel_limit_max: 0.2,
      gripper_grasp_dist: 20,
      gripper_open_dist: 105,
      cartesian_position_rel_right: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      cartesian_position_rel_left: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      cartesian_position_abs_right: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      cartesian_position_abs_left: {'X': 0, 'Y': 0, 'Z': 0, 'Rx': 0, 'Ry': 0, 'Rz': 0},
      logs: [], //['Logs console...'],
      feedback_msgs: [{prop: "speed_right", name: 'Speed right', val: '0.0 mm/s'}, {prop: "speed_left", name: 'Speed left', val: '0.0 mm/s'}, {prop: "eef_right_status", name: 'Right EEF status', val: '-'}, {prop: "eef_left_status", name: 'Left EEF status', val: '-'}, {prop: "process_time", name: 'Process time', val: '00:00'}]
    }
  },

  methods: {
    init_subscribers(){
      this.index_topic = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/process_index',
        messageType : 'std_msgs/Int32'
      });
      this.index_topic.subscribe((message) => {
        if(message.data >= this.operation_list.length){
          this.op_selected = 0
        }else{
          this.op_selected = message.data;
        }
      });

      for (const [key, value] of Object.entries(this.camera_list)) {
        this.rviz_image_topics[key.toString()] = new ROSLIB.Topic({
          ros : this.ros,
          name : value,
          messageType : 'sensor_msgs/CompressedImage'
        });
        this.rviz_image_topics[key.toString()].subscribe((message) => {
          //console.log('RVIZ image ' + key.toString() + ' updated');
          if (value == this.camera_selected){
            this.last_time = Date.now();
            this.rviz_image = "data:image/jpg;base64," + message.data;
          }
        });
      }

      /*
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

      this.rviz_image3_topic = new ROSLIB.Topic({
        ros : this.ros,
        name : '/camera3/image/compressed',
        messageType : 'sensor_msgs/CompressedImage'
      });      
      this.rviz_image3_topic.subscribe((message) => {
        //console.log('RVIZ image 3 updated');
        if (this.rviz_image3_topic.name == this.camera_selected){
          this.last_time = Date.now();
          this.rviz_image = "data:image/jpg;base64," + message.data;
        }
      });
      */

      this.topic_mode = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/mode',
        messageType : 'std_msgs/String'
      });
      this.topic_mode.subscribe((message) => {
        this.modeProp = message.data;
      });

      this.topic_logs = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/logs',
        messageType : 'std_msgs/String'
      });
      this.topic_logs.subscribe((message) => {
        this.add_logs(message.data);
      });

      this.topic_feedback = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/feedback',
        messageType : 'UI_nodes_pkg/configProp',
        //messageType : 'std_msgs/String'topic_feedback
      });
      this.topic_feedback.subscribe((message) => {
        //this.feedback_msgs[0].val = message.value;
        for (const [key, value] of Object.entries(this.feedback_msgs)) {
          if(value.prop.includes(message.prop)){
            value.val = message.value;
            break;
          }
        }
      });

      this.topic_robot_status = new ROSLIB.Topic({
        ros : this.ros,
        name : '/robot_status',
        messageType : 'industrial_msgs/RobotStatus'
      });
      this.topic_robot_status.subscribe((message) => {
        this.robot_enable_status = message.motion_possible.val==1;
      });

      this.confirm_subs = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/confirm_req',
        messageType : 'std_msgs/String'
      });
      this.confirm_subs.subscribe((message) => {
        this.visualize_confirmation = true
      });

      this.topic_record_time = new ROSLIB.Topic({
        ros : this.ros,
        name : '/OAK/record_time',
        messageType : 'std_msgs/String'
      });
      this.topic_record_time.subscribe((message) => {
        console.log("AAA")
        this.recording_time = message.data;
        console.log(message.data)
        if (message.data == "00:00"){
          this.recording = false;
        }
        else{
          this.recording = true;
        }
      });
    },

    stop_subscribers(){
      if(this.index_topic){
        this.index_topic.unsubscribe();
      }
      if(this.topic_mode){
        this.topic_mode.unsubscribe();
      }
      if(this.topic_logs){
        this.topic_logs.unsubscribe();
      }
      if(this.topic_feedback){
        this.topic_feedback.unsubscribe();
      }
      for (const [key, value] of Object.entries(this.rviz_image_topics)) {
        if (value){
          value.unsubscribe();
        }
      }
      if(this.topic_robot_status){
        this.topic_robot_status.unsubscribe();
      }
      if(this.topic_record_time){
        this.topic_record_time.unsubscribe();
      }
      /*
      if (this.rviz_image1_topic){
        this.rviz_image1_topic.unsubscribe();
      }
      if (this.rviz_image2_topic){
        this.rviz_image2_topic.unsubscribe();
      }
      if (this.rviz_image3_topic){
        this.rviz_image3_topic.unsubscribe();
      }
      */
    },

    init_services(){
        this.get_arms_pose_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/get_arms_pose',
            serviceType : 'UI_nodes_pkg/ArmsPose'
        });
        this.get_moveit_groups_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/get_moveit_groups',
            serviceType : 'UI_nodes_pkg/MoveitGroups'
        });
        this.move_group_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/move_group',
            serviceType : 'UI_nodes_pkg/MoveGroupSrv'
        });
        this.get_all_operations_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/process/all_operations',
            serviceType : 'UI_nodes_pkg/StringArray'
        });
        this.get_mode_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/get_mode',
            serviceType : 'std_srvs/Trigger'
        });
        this.robot_enable_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/robot_enable',
            serviceType : 'std_srvs/Trigger'
        });
        this.robot_disable_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/robot_disable',
            serviceType : 'std_srvs/Trigger'
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
      //
      this.operation_list = []
      var request = new ROSLIB.ServiceRequest({});  
      this.get_all_operations_service.callService(request, (result) => {
        for (const [key, value] of Object.entries(result.msg)) {
          this.operation_list.push(value)
        }
      });
    },

    check_mode(){
      var request = new ROSLIB.ServiceRequest({});  
      this.get_mode_service.callService(request, (result) => {
        this.modeProp = result.message
        if (result.message == "Running"){
          this.robot_moving = true
        }
      });
    },

    check_robot_con(){
      setTimeout(() => { //Check periodically
        this.ros.getNodes((nodes) => {
            if (nodes.includes('/move_group')){
              if (nodes.includes('/io_relay')){
                this.real_robot_con = true
                this.demo_robot_con = false
                this.speed_limit_max = 0.2
                this.accel_limit_max = 0.2
              }
              else{
                this.real_robot_con = false
                this.demo_robot_con = true
                this.speed_limit_max = 1.0
                this.accel_limit_max = 1.0
              }
            }
            else{
              this.real_robot_con = false
              this.demo_robot_con = false
              this.speed_limit_max = 0.0
              this.accel_limit_max = 0.0
            }        
        });
      }, 500)
    },

    publish_bool(topic, message){
      var boolPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic,
        messageType : 'std_msgs/Bool'
      });
      var boolTopic = new ROSLIB.Message({
          data: message
      });
      boolPublisher.publish(boolTopic);
      console.log(this.rosCon)
    },

    publish_int(topic, message){
      var intPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic,
        messageType : 'std_msgs/Int32'
      });
      var intMsg = new ROSLIB.Message({
          data: message
      });
      intPublisher.publish(intMsg);
      console.log(this.rosCon)
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

    update_select_group(){
      if (this.group_selected){
        if(!(this.robot_groups[this.group_selected].includes(this.config_selected))){
          this.config_selected = this.robot_groups[this.group_selected][0]
        }
      }
    },

    robot_enable(){
      var request = new ROSLIB.ServiceRequest({}); 
      this.robot_enable_service.callService(request, (result) => {});
    },

    robot_disable(){
      var request = new ROSLIB.ServiceRequest({}); 
      this.robot_disable_service.callService(request, (result) => {});
    },

    check_speed_limit(){
      if (parseFloat(this.speed_limit)>this.speed_limit_max){
        this.speed_limit = String(this.speed_limit_max)
      }
      if (parseFloat(this.speed_limit)<0){
        this.speed_limit = "0"
      }
    },

    check_accel_limit(){
      if (parseFloat(this.accel_limit)>this.accel_limit_max){
        this.accel_limit = String(this.accel_limit_max)
      }
      if (parseFloat(this.accel_limit)<0){
        this.accel_limit = "0"
      }
    },

    check_gripper_limit(tool_name, lower_limit){
      if (parseFloat(this.tools[tool_name]['distance'])>this.gripper_open_dist){
        this.tools[tool_name]['distance'] = String(this.gripper_open_dist)
      }
      if (parseFloat(this.tools[tool_name]['distance'])<lower_limit){
        this.tools[tool_name]['distance'] = String(lower_limit)
      }
    },

    move_group_manual(){
      //Predefined pose
      if(parseInt(this.manual_opt)==0){
        var request = new ROSLIB.ServiceRequest({
            group: this.group_selected,
            type: parseInt(this.manual_opt),
            target_named: this.config_selected,
            speed_limit: parseFloat(this.speed_limit),
            accel_limit: parseFloat(this.accel_limit),
        });
      }
      //Relative and absolute cartesian
      else if (parseInt(this.manual_opt)==1 || parseInt(this.manual_opt)==2){
        let target_pose_left = null
        let target_pose_right = null
        if (parseInt(this.manual_opt)==1){
          target_pose_left = new ROSLIB.Message({
            x: parseFloat(this.cartesian_position_rel_left['X']),
            y: parseFloat(this.cartesian_position_rel_left['Y']),
            z: parseFloat(this.cartesian_position_rel_left['Z']),
            rx: parseFloat(this.cartesian_position_rel_left['Rx']),
            ry: parseFloat(this.cartesian_position_rel_left['Ry']),
            rz: parseFloat(this.cartesian_position_rel_left['Rz']),
          })
          target_pose_right = new ROSLIB.Message({
            x: parseFloat(this.cartesian_position_rel_right['X']),
            y: parseFloat(this.cartesian_position_rel_right['Y']),
            z: parseFloat(this.cartesian_position_rel_right['Z']),
            rx: parseFloat(this.cartesian_position_rel_right['Rx']),
            ry: parseFloat(this.cartesian_position_rel_right['Ry']),
            rz: parseFloat(this.cartesian_position_rel_right['Rz']),
          })
        }
        else{
          target_pose_left = new ROSLIB.Message({
            x: parseFloat(this.cartesian_position_abs_left['X']),
            y: parseFloat(this.cartesian_position_abs_left['Y']),
            z: parseFloat(this.cartesian_position_abs_left['Z']),
            rx: parseFloat(this.cartesian_position_abs_left['Rx']),
            ry: parseFloat(this.cartesian_position_abs_left['Ry']),
            rz: parseFloat(this.cartesian_position_abs_left['Rz']),
          })
          target_pose_right = new ROSLIB.Message({
            x: parseFloat(this.cartesian_position_abs_right['X']),
            y: parseFloat(this.cartesian_position_abs_right['Y']),
            z: parseFloat(this.cartesian_position_abs_right['Z']),
            rx: parseFloat(this.cartesian_position_abs_right['Rx']),
            ry: parseFloat(this.cartesian_position_abs_right['Ry']),
            rz: parseFloat(this.cartesian_position_abs_right['Rz']),
          })
        }
        const target_pose_msg = new ROSLIB.Message({
          left: target_pose_left,
          right: target_pose_right,
        })
        console.log(target_pose_msg)
        var request = new ROSLIB.ServiceRequest({
            group: 'arms',
            type: parseInt(this.manual_opt),
            target_pose: target_pose_msg,
            speed_limit: parseFloat(this.speed_limit),
            accel_limit: parseFloat(this.accel_limit),
        });
        console.log(request)
      }
  
      console.log("Robot moving...")
      this.add_logs("(Manual) Moving " + request.group.toString() + "...")
      this.robot_moving = true
      this.publish_string_constant('/UI/mode','Running')
      this.move_group_service.callService(request, (result) => {
        console.log(result.success)
        if (result.success){
          this.add_logs("(Manual) Successful motion.")
        }else{
          this.add_logs("(Manual) Motion failure.")
        }
        this.robot_moving = false
        this.publish_string_constant('/UI/mode','Idle')
      });
    },

    reset_cartesian(arm_side, motion_type){
      //Relative
      if (parseInt(motion_type)==1){
        if (arm_side == "left"){
          this.cartesian_position_rel_left = {X:0, Y:0, Z:0, Rx:0, Ry:0, Rz:0}
        } else if (arm_side == "right"){
          this.cartesian_position_rel_right = {X:0, Y:0, Z:0, Rx:0, Ry:0, Rz:0}
        }
      }
      //Absolute
      else if(parseInt(motion_type)==2){
        var request = new ROSLIB.ServiceRequest({});
        this.get_arms_pose_service.callService(request, (result) => {
          console.log(result.success)
          if (result.success){
            if (arm_side == "left" || arm_side == "both"){
              this.cartesian_position_abs_left.X = ((result.left.x)*1000).toFixed(1)
              this.cartesian_position_abs_left.Y = ((result.left.y)*1000).toFixed(1)
              this.cartesian_position_abs_left.Z = ((result.left.z)*1000).toFixed(1)
              this.cartesian_position_abs_left.Rx = (result.left.rx*(180/Math.PI)).toFixed(2)
              this.cartesian_position_abs_left.Ry = (result.left.ry*(180/Math.PI)).toFixed(2)
              this.cartesian_position_abs_left.Rz = (result.left.rz*(180/Math.PI)).toFixed(2)
            } 
            if (arm_side == "right" || arm_side == "both"){
              this.cartesian_position_abs_right.X = ((result.right.x)*1000).toFixed(1)
              this.cartesian_position_abs_right.Y = ((result.right.y)*1000).toFixed(1)
              this.cartesian_position_abs_right.Z = ((result.right.z)*1000).toFixed(1)
              this.cartesian_position_abs_right.Rx = (result.right.rx*(180/Math.PI)).toFixed(2)
              this.cartesian_position_abs_right.Ry = (result.right.ry*(180/Math.PI)).toFixed(2)
              this.cartesian_position_abs_right.Rz = (result.right.rz*(180/Math.PI)).toFixed(2)
            }
          }
        });
      }
    },

    move_gripper(arm, dist, type){
      //Create topic name based of arm and type
      var arm_fake = "left"
      var topic_gripper = "/"+String(arm_fake)+"_wsg/action/"+type+"/goal"
      //Publish that topic with a certain width and speed
      if(parseFloat(dist)<this.gripper_grasp_dist){
        dist = String(this.gripper_grasp_dist)
      }
      var gripperPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic_gripper,
        messageType : 'rviz_test/gripper_ActActionGoal'
      });

      var gripperGoalMsg = new ROSLIB.Message({
          width: parseFloat(dist),
          speed: 30.0,
      });
      var gripperMsg = new ROSLIB.Message({
          goal: gripperGoalMsg,
      });

      gripperPublisher.publish(gripperMsg);
    },

    confim_response(msg){
      this.publish_string('UI/confirm_res',msg)
      this.visualize_confirmation = false
    },

    add_logs(msg){
      var time_now= new Date().toLocaleTimeString();
      time_now=time_now.slice(0,-3);
      this.logs.unshift(time_now + ": " + msg);
    },

    monitoring_method(){
      this.ros.getNodes((nodes) => {
        if (nodes.includes("/multiple_OAK")){
          this.active_record = true;
        }
        else{
          this.active_record = false;
        }
      });
      setTimeout(() => { //Check periodically
        this.monitoring_method() 
      }, 1000);
    },

    test_method(){
      console.log("Hello test")
      this.ros.getServices((services) => {
        console.log(services);
      });
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
      this.init_subscribers()
      this.init_services()
      this.update_variables()
      this.check_mode()
      this.check_robot_con()
      this.reset_cartesian('both', 2)
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
    this.monitoring_method()
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
  background-color: #303030;
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
.block_items *{
  margin: auto;
  display: block;
}
.block_items{
  margin: auto;
}
.inline_items_feedback{
  display: inline-block;
  padding: 2px;
  margin: 2px;
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
  width: 45px;
  margin-left: 4px;
  margin-right: 6px;
  font-size: 12px;
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
  text-align: left;
  flex-direction:column-reverse;
}
.logs .messages *{
  padding: 4px;
}
option{
  padding-right: 2px;
}
.small_letter{
  font-size: 10px;
}
.small_letter *{
  font-size: 11px;
  margin-left: 2px;
  margin-right: 2px;
}
.feedback_name{
  width: 150px;
  margin-right: 5px;
  text-align: right;
}
.feedback_value{
  background-color: #716f8c;
  color: #1d1b31;
  padding: 3px;
  padding-left: 5px;
  border-radius: 5px;
  width: 150px;
  text-align: left;
}
.speed_limits input{
  width: 50px;
  margin-right: 20px;
  margin-bottom: 10px;
  padding-right: 4px;
}
.record_control{
  margin-right: 15px;
  margin-left: 15px;
  margin-bottom: 15px;
  margin-top: 20px;
  font-size: 14px;
}
.record_control button{
  width: 60px;
  height: 25px;
  margin: 3px;
}
.recording_time{
  background-color: #716f8c;
  color: #1d1b31;
  padding: 3px;
  padding-left: 5px;
  border-radius: 5px;
  width: 150px;
  text-align: left;
}
</style>