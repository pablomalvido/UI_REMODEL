<template>
  <div>
    <TitlePage page='Teaching'/>
  </div>

  <div class="content">

    <div class="container">
    <div class="left_content">
    <div class="Record">
      
      <h3>Record trajectory</h3>
      <div class="Selection">
        <label>Robot: </label>
        <select v-model="group_selected">
          <!-- <option disabled value="">Please Select</option> -->
          <option v-for="(robot, index) in robot_groups" :key="index" :value="robot">{{robot}}</option>
        </select>
        <label>End effector: </label>
        <select v-model="tool_selected">
          <!-- <option disabled value="">Please Select</option> -->
          <option v-for="(tool, index) in robot_tools" :key="index" :value="index">{{tool}}</option>
        </select>
      </div>

      <div class="Record_buttons">
        <button :disabled="modeProp=='Running'" @click="record_traj_function('pose')">Record pose</button>
        <button :disabled="modeProp=='Running'" v-if="tool_selected==0" @click="record_traj_function('gripper_move')">Move gripper</button>
        <button :disabled="modeProp=='Running'" v-if="tool_selected==0" @click="record_traj_function('gripper_grasp')">Grasp</button>
        <button :disabled="modeProp=='Running'" v-if="tool_selected==1" @click="record_traj_function('tape')">Tape</button>
      </div>

      <div class="Record_save">
        <label>Trajectory name:</label>
        <input type="text" v-model="traj_name">
        <button :disabled="poses_count==0 || traj_name=='' || modeProp=='Running'" @click="record_traj_function('save')">Save</button>
      </div>
    </div>

    <div class="Execute">
      <h3>Execute trajectory</h3>
        <label>Trajectory: </label>
        <select v-model="traj_selected">
          <option disabled value="">Please Select</option>
          <option v-for="(traj, index) in trajectory_list" :key="index" :value="traj">{{traj}}</option>
        </select>
        <button :disabled="modeProp=='Running' || traj_selected==''" @click="exec_traj_func()">Execute</button>
        <button :disabled="modeProp=='Running' || traj_selected==''" @click="delete_traj_func()">Delete</button>
    </div>
    </div>

    <div class="right_content">
      <div class="logs">
        <h3>Logs</h3>
      <div class="messages">
      <ul v-for="(message_log, key) in logs" :key="key">
        <il>{{message_log}}</il>
      </ul>
      </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import ROSLIB from "roslib";
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Teaching',

  components: {TitlePage},

  data(){
    return{
      rosCon: false,
      modeProp: 'Idle',
      menuOpen: true,
      get_mode_service: null,
      traj_record_service: null,
      get_trajs_service: null,
      exec_traj_service: null,
      del_traj_service: null,
      topic_mode: null,
      robot_groups: ['R1', 'R2'],
      robot_tools: {0:'Gripper', 1:'Taping gun'},
      group_selected: 'R1',
      tool_selected: 0,
      traj_name: '',
      trajectory_list: [],
      traj_selected: '',
      poses_count: 0,
      robot_moving: false,
      logs: [], //['Logs console...'],
    }
  },

  methods: {
    init_subscribers(){
      this.topic_mode = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/mode',
        messageType : 'std_msgs/String'
      });
      this.topic_mode.subscribe((message) => {
        this.modeProp = message.data;
      });
    },

    stop_subscribers(){
      if(this.topic_mode){
        this.topic_mode.unsubscribe();
      }
    },

    init_services(){
      this.get_mode_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/UI/get_mode',
          serviceType : 'std_srvs/Trigger'
      });
      this.get_trajs_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/get_trajectories',
          serviceType : 'UI_nodes_pkg/GetTraj'
      });
      this.traj_record_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/trajectory_record',
          serviceType : 'UI_nodes_pkg/RecordTraj'
      });    
      this.exec_traj_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/execute_trajectory',
          serviceType : 'UI_nodes_pkg/ExecTraj'
      });
      this.del_traj_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/delete_trajectory',
          serviceType : 'UI_nodes_pkg/ExecTraj'
      });
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

    check_mode(){
      var request = new ROSLIB.ServiceRequest({});  
      this.get_mode_service.callService(request, (result) => {
        this.modeProp = result.message
        if (result.message == "Running"){
          this.robot_moving = true
        }
        else{
          this.robot_moving = false
        }
      });
    },

    updateTrajs(){
      var request = new ROSLIB.ServiceRequest({});  
      this.get_trajs_service.callService(request, (result) => {
        this.trajectory_list = []
        if(result.success){
          for (const [key, traj_name] of Object.entries(result.data)){
            this.trajectory_list.push(traj_name)
          }
        }
      });
    },

    record_traj_function(opt){
      var request = new ROSLIB.ServiceRequest({
        robotNumber: this.group_selected,
        recordPose: false,
        moveGripper: false,
        closeGripper: false,
        tape: false,
        saveTraj: false,
        fileName: this.group_selected + '_' + this.traj_name,
      });  
      if(opt=='pose'){
        request.recordPose = true;
      }
      else if(opt=='gripper_move'){
        request.moveGripper = true;
      }
      else if(opt=='gripper_grasp'){
        request.closeGripper = true;
      }
      else if(opt=='tape'){
        request.tape = true;
      }
      else if(opt=='save'){
        request.saveTraj = true;
      }
      this.traj_record_service.callService(request, (result) => {
        this.add_logs(result.result)
        if(result.success){
          if(opt=='save'){
            this.poses_count = 0;
            this.traj_name = '';
            this.updateTrajs();
          }
          else{
            this.poses_count += 1;
          }
        }
      });
    },

    exec_traj_func(){
      this.add_logs("Executing trajectory: " + this.traj_selected + "...")
      this.publish_string_constant('/UI/mode','Running')

      var publisher_exec = new ROSLIB.Topic({
        ros : this.ros,
        name : "/trajectory_server/goal",
        messageType : 'robot_control/TrajectoryActionGoal'
      });

      var message1 = new ROSLIB.Message({
          file_name: this.traj_selected,
      });

      var message = new ROSLIB.Message({
          goal: message1,
      });

      publisher_exec.publish(message);

      // var request = new ROSLIB.ServiceRequest({
      //   data: this.traj_selected,
      // });  
      // this.exec_traj_service.callService(request, (result) => {
      //   this.add_logs(result.result)
      //   this.publish_string_constant('/UI/mode','Idle')
      // });
      this.add_logs("Successful motion")
      this.publish_string_constant('/UI/mode','Idle')
    },

    delete_traj_func(){
      this.add_logs("Deleting trajectory: " + this.traj_selected + "...")
      var request = new ROSLIB.ServiceRequest({
        data: this.traj_selected,
      });  
      this.del_traj_service.callService(request, (result) => {
        if(result.success){
          this.add_logs("Deleted successfully")
        }
        else{
          this.add_logs("Error deleting trajectory")
        }
      });
      setTimeout(() => {
        this.updateTrajs();
        this.traj_selected = '';
      }, 200)
    },

    add_logs(msg){
      var time_now= new Date().toLocaleTimeString();
      time_now=time_now.slice(0,-3);
      this.logs.unshift(time_now + ": " + msg);
    },
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
      //this.check_mode()
      this.updateTrajs()
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
    this.stop_subscribers()
    this.ros.close()
  }
}
</script>

<style scoped>

.content{
  position: relative;
  margin: 20px;
  margin-top: 60px;
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
  width: 420px;
  display: inline-block;
  float: left;
  /* left: 29%; */
}
select{
  padding:1px;
  padding-left:5px;
  padding-right: 5px;
  border: 1px solid #1d1b31;
  border-radius: 5px;
}
.Record{
  background-color: #49485e;
  width: fit-content;
  border-radius: 15px;
  border: 2px solid #1d1b31;
  color:white;
  padding: 0px 15px 10px 15px;
}
.Execute{
  background: #716f8c;
  width: fit-content;
  border-radius: 15px;
  border: 2px solid #1d1b31;
  color:white;
  padding: 5px 15px 15px 15px;
  margin: auto;
}
button{
  border: 1px solid #1d1b31;
  border-radius: 5px;
}
.left_content h3{
  margin-top: 10px;
  padding-bottom: 10px;
}
.Selection{
  margin-top: 8px;
}
.Record_buttons{
  margin-top: 15px;
}
.Record_save{
  margin-top: 10px;
  margin-bottom: 10px;
}
.Execute{
  margin-top: 60px;
  margin-bottom: 10px;
}
.Record_buttons button{
  width: 110px;
  height: 30px;
  margin: 5px;
}
.Record_save button{
  width: 50px;
  height: 30px;
  margin: 5px;
}
.Execute button{
  width: 80px;
  height: 30px;
  margin: 5px;
}
input{
  height: 30px;
  width: 150px;
  margin-left: 5px;
  margin-right: 10px;
  text-align: left;
  border: 1px solid #1d1b31;
  border-radius: 3px;
  padding-left: 2px; 
}
select{
  height: 30px;
  width: fit-content;
  padding: 2px 5px 2px 5px;
  margin: 0px 10px 0px 3px;
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
  height: 330px;
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
</style>