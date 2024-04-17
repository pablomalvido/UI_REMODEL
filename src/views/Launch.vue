<template>
    <div>
      <TitlePage page='Launch'/>
    </div>
    <!-- <h1>Home page</h1> -->
    <div class="content">
        <div class= "launchers">
            <ul v-for="(launcher, key) in launchers" :key="key">
                <li class="launcherID" :class="launcher.name" v-if="launcher.roles.includes(role_user)">
                    <p>{{launcher.name}}</p>
                    <button @click="launch_start(key)" :disabled="launcher.active!='gray' || global_launching">Launch</button>
                    <button @click="launch_stop(key)" :disabled="(launcher.active!='green' && launcher.active!='red') || global_launching">Stop</button>
                    <span class="dot" :class = "launcher.active"></span>
                </li>
            </ul>
        </div>
  </div>
</template>

<script>
import ROSLIB from "roslib";
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Launch',

  components: {TitlePage},

  data(){
    return{
      rosCon: false,
      modeProp: '',
      role_user: this.$route.params.role,
      launchers: {
        1: {name: 'Robot', launch_files:[{pkg: 'motoman_sda10f_moveit_config', file: 'moveit_planning_execution_no_gripper'}], active: 'gray', nodes:['/io_relay','/joint_state','/joint_trajectory_action','/move_group','/motion_streaming_interface','/robot_state_publisher'], roles:['Administrator', 'Operator']},
        3: {name: 'Grippers', launch_files:[{pkg: 'wsg_50_driver', file: 'dual_wsg_50_tcp_actions'}], active: 'gray', nodes:['/gripper_action_server', '/left_wsg/wsg_50_driver', '/right_wsg/wsg_50_driver'], roles:['Administrator', 'Operator']},
        4: {name: 'Grippers (L)', launch_files:[{pkg: 'wsg_50_driver', file: 'left_wsg_50_tcp_actions'}], active: 'gray', nodes:['/gripper_action_server_left', '/left_wsg/wsg_50_driver'], roles:['Administrator', 'Operator']},
        5: {name: 'Grippers (R)', launch_files:[{pkg: 'wsg_50_driver', file: 'right_wsg_50_tcp_actions'}], active: 'gray', nodes:['/gripper_action_server_right', '/right_wsg/wsg_50_driver'], roles:['Administrator', 'Operator']},
        6: {name: 'Taping gun', launch_files:[{pkg: 'UI_nodes_pkg', file: 'taping_gun'}], active: 'gray', nodes:['/service_gun_socket'], roles:['Administrator', 'Operator']},
        2: {name: 'Robot demo', launch_files:[{pkg: 'motoman_sda10f_moveit_config', file: 'demo_no_gripper_camera'}], active: 'gray', nodes:['/joint_state_publisher','/move_group','/robot_state_publisher'], roles:['Administrator', 'Operator']},
        7: {name: 'CAD Platform', launch_files:[{pkg: 'elvez_pkg', file: 'launcher'}], active: 'gray', nodes:['/ATC_rf','/UC2_handler','/combs_rf','/platform_rf'], roles:['Administrator', 'Operator']}, 
        8: {name: 'Process control', launch_files:[{pkg: 'UI_nodes_pkg', file: 'process'}], active: 'gray', nodes:['/elvez_process_action_server','/process_action_client','/process_feedback'], roles:['Administrator', 'Operator']},
        9: {name: 'Manual control', launch_files:[{pkg: 'UI_nodes_pkg', file: 'moveit_manual'}], active: 'gray', nodes:['/moveit_manual'], roles:['Administrator']},
        10: {name: 'Cameras', launch_files:[{pkg: 'vision_pkg_full_demo', file: 'camera'}], active: 'gray', nodes:['/multiple_OAK'], roles:['Administrator','Operator']},
        11: {name: 'Vision system', launch_files:[{pkg: 'vision_pkg_full_demo', file: 'vision'}], active: 'gray', nodes:['/DLO_detection_node'], roles:['Administrator','Operator']},
        15: {name: 'Configuration', launch_files:[{pkg: 'UI_nodes_pkg', file: 'config'}], active: 'gray', nodes:['/config_node'], roles:['Administrator']},  
        12: {name: 'Force sensor (L)', launch_files:[{pkg: 'norbdo_force_sensor', file: 'left_norbdo'}], active: 'gray', nodes:['/left_norbdo/norbdo_fs'], roles:['Administrator','Operator']},
        13: {name: 'Force sensor (R)', launch_files:[{pkg: 'norbdo_force_sensor', file: 'right_norbdo'}], active: 'gray', nodes:['/right_norbdo/norbdo_fs'], roles:['Administrator','Operator']},      
        14: {name: 'Fake sensors', launch_files:[{pkg: 'UI_nodes_pkg', file: 'fake_sensors'}], active: 'gray', nodes:['/fake_sensors'], roles:['Administrator']},
        18: {name: 'Record trajectory', launch_files:[{pkg: 'UI_nodes_pkg', file: 'record_traj'}], active: 'gray', nodes:['/record_traj'], roles:['Administrator']},
        17: {name: 'Safety manager', launch_files:[{pkg: 'remodel_safety_manager', file: 'RSM'}], active: 'gray', nodes:['/RSM_PLC_connection'], roles:['Administrator', 'Operator']},
        16: {name: 'CAD files update', launch_files:[{pkg: 'elvez_pkg', file: 'update_files'}], active: 'gray', nodes:['/CAD_loader'], roles:['Administrator']},                
        // 10: {name: 'Test', launch_files:[{pkg: 'test_pkg', file: 'print_loop'}], active: 'gray', nodes:['/print_loop_node','/print_loop_node_infinite']},
        99: {name: 'All', launch_files:[], active: 'gray', nodes:[''], roles:['Administrator', 'Operator']},
      },
      global_launching: false,
      //launch_service: null,
      stop_service: null,  
      active_nodes: [],
      first_time: true,
      launch_files_temp: [],
      nodes_temp: [],
      service_data: [],
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

    init_services(){
        this.launch_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI_launcher/launch_multiple',
            serviceType : 'UI_nodes_pkg/launch_multiple'
        });
        this.stop_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI_launcher/stop_multiple',
            serviceType : 'UI_nodes_pkg/launch_multiple'
        });
    },

    create_all_launcher(){
      this.launch_files_temp = []
      this.nodes_temp = []
      for (const [key, value] of Object.entries(this.launchers)) {
        if (key!=99 && value.roles.includes(this.role_user)){
          for (let i = 0; i < value.launch_files.length; i++) {
            this.launch_files_temp.push({pkg: value.launch_files[i].pkg, file:value.launch_files[i].file})
          }
          this.nodes_temp = this.nodes_temp.concat(value.nodes)
        }
      }
      this.launchers[99].launch_files = this.launch_files_temp
      this.launchers[99].nodes = this.nodes_temp
      // console.log(this.launchers[99].launch_files)
      // console.log(this.launchers[99].nodes)
    },

    launch_start(launcher_id){
      this.global_launching = true
      // console.log(this.launchers[launcher_id])
      this.service_data = []
      for (let i = 0; i < this.launchers[launcher_id].launch_files.length; i++) {
        var launch_file_i = new ROSLIB.Message({
          pkg: this.launchers[launcher_id].launch_files[i].pkg,
          file: this.launchers[launcher_id].launch_files[i].file
        })
        this.service_data.push(launch_file_i)
      }
      var request = new ROSLIB.ServiceRequest({
          data : this.service_data
      });
  
      this.launchers[launcher_id].active = 'orange'
      this.launch_service.callService(request, (result) => {
          console.log('Result for service call on ' + this.launch_service.name + ': ' + result.success);
      });
      
      this.check_started(launcher_id)
    },

    launch_stop(launcher_id){
      this.global_launching = true
      this.service_data = []
      for (let i = 0; i < this.launchers[launcher_id].launch_files.length; i++) {
        var launch_file_i = new ROSLIB.Message({
          pkg: this.launchers[launcher_id].launch_files[i].pkg,
          file: this.launchers[launcher_id].launch_files[i].file
        })
        this.service_data.push(launch_file_i)
      }
      var request = new ROSLIB.ServiceRequest({
          data : this.service_data
      });
    
      this.stop_service.callService(request, (result) => {
          console.log('Result for service call on ' + this.launch_service.name + ': ' + result.success);
          this.launchers[launcher_id].active = 'orange';
      });

      setTimeout(() => {
          this.ros.getNodes((nodes) => {
              var killed = true;
              for (let i = 0; i < this.launchers[launcher_id].nodes.length; i++) {
                  // console.log(this.launchers[launcher_id].nodes[i])
                  // console.log(nodes)
                  if (nodes.includes(this.launchers[launcher_id].nodes[i])){
                      killed = false;
                      break; 
                  }
              }
              if (killed){
                  this.launchers[launcher_id].active = 'gray';
                  this.global_launching = false
              }
              else if (launcher_id==99){
                this.launch_stop(99)
              }
          });
      }, 2500)
    },

    check_started(launcher_id){
        this.ros.getNodes((nodes) => {
            var started = true;
            for (let i = 0; i < this.launchers[launcher_id].nodes.length; i++) {
                // console.log(this.launchers[launcher_id].nodes[i])
                // console.log(nodes)
                if (!nodes.includes(this.launchers[launcher_id].nodes[i])){
                    started = false;
                    console.log("Nodes not started yet")
                    break; 
                }
            }
            if (started){
                this.launchers[launcher_id].active = 'green';
                console.log("Nodes started")
                this.global_launching = false
            }
            else if(this.launchers[launcher_id].active != 'gray'){
              console.log("Call function again")
              setTimeout(() => {
                  this.check_started(launcher_id) 
              }, 500)
            };
        });
    },

    getLaunchersState(){
      this.ros.getNodes((nodes) => {
          // console.log(nodes)
          for (const [key, value] of Object.entries(this.launchers)) {
            if (value.active != 'orange'){
              // console.log(key)
              // console.log(value)
              var active_num = 0;
              for (let i = 0; i < value.nodes.length; i++) {
                if (nodes.includes(value.nodes[i])){
                    active_num += 1;
                }
              }
              if (active_num == 0){
                if (value.active == 'green' || value.active == 'red'){
                  this.launchers[key].active = 'orange';
                  this.global_launching = true
                  this.launch_stop(key)
                }
                else{
                  this.launchers[key].active = 'gray';
                }
              }
              else if (active_num == value.nodes.length){
                this.launchers[key].active = 'green';
              }
              else{
                this.launchers[key].active = 'red';
              }
            }
          }
          if (this.first_time){
            this.first_time = false
            this.global_launching = false
          }
          setTimeout(() => { //Check periodically
              this.getLaunchersState() 
          }, 2000)
      });
    },
  },

  mounted(){
    this.global_launching = true
    this.first_time = true

    this.url = 'ws://' + (((window.location.href).split("/")[2]).split(":")[0]) + ':9090';
    this.ros = new ROSLIB.Ros({
        url : this.url //'ws://192.168.43.168:9090'
    });
    console.log(this.ros)
    
    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.rosCon = true
      this.init_services()
      this.getLaunchersState()
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })

    this.create_all_launcher()
  },

  unmounted(){
    this.ros.close()
  }
}
</script>

<style scoped>

.content{
    position: relative;
    margin: 40px 10% 20px 20px;
    z-index: 200;
    overflow: scroll; 
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

}
.launchers{
    background-color: #716f8c;
    width: fit-content;
    padding: 0px;
    align-items: center;
    text-align: center;
    border-radius: 15px;
    border: 2px solid #1d1b31;
    color:white
}
ul {
    list-style-type: none;
}
li{
    margin: 20px;
    /* overflow: scroll; 
    text-overflow: ellipsis;
    white-space: nowrap; */
} 
li *{
    display: inline-block;
    overflow: scroll; 
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
}
li p{
    width: 180px;
    font-size: 20px;
    margin-right: 30px;
    text-align: right;
}
.launcherID.All{
  background: #1d1b31;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 10px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}
button{
    width: 120px;
    height: 50px;
    font-size: 16px;
    margin: 10px;
    border: 1px solid #1d1b31;
    border-radius: 5px;
}
.launcherID.All button{
  border: 1px solid #716f8c;
}
.dot {
    height: 25px;
    width: 25px;
    background-color: #bbb;
    border-radius: 50%;
    text-align: center;
    display: inline-block;
    border: 1px solid #1d1b31;
    margin-left: 19px;
}
.dot.green{
    background-color: #90EE90;
}
.dot.orange{
    background-color: orange;
}
.dot.red{
    background-color: red;
}
</style>