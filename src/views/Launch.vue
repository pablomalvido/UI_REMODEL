<template>
    <div>
      <TitlePage page='Launch'/>
    </div>
    <!-- <h1>Home page</h1> -->
    <div class="content">
        <div class= "launchers">
            <ul v-for="(launcher, key) in launchers" :key="key">
                <li>
                    <p>{{launcher.name}}</p>
                    <button @click="launch_start(key)" :disabled="launcher.active!='gray' || global_launching">Launch</button>
                    <button @click="launch_stop(key)" :disabled="launcher.active!='green' || global_launching">Stop</button>
                    <span class="dot" :class = "launcher.active"></span>
                </li>
            </ul>
        </div>
  </div>
</template>

<script>
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Launch',

  components: {TitlePage},

  data(){
    return{
      msg: 'Hellooo',
      rosCon: false,
      modeProp: '',
      menuOpen: true,
      launchers: {
        1: {name: 'Robot demo', pkg: 'motoman/motoman_sda10f_moveit_config', file: 'demo_no_gripper', active: 'gray', nodes:['/joint_state_publisher','/move_group','/robot_state_publisher']}, 
        2: {name: 'CAD Platform', pkg: 'elvez_pkg', file: 'launcher', active: 'gray', nodes:['/ATC_rf','/UC2_handler','/combs_rf','/platform_rf']},
        3: {name: 'Test', pkg: 'test_pkg', file: 'print_loop', active: 'gray', nodes:['/print_loop_node']},
      },
      global_launching: false,
      launch_service: null,
      stop_service: null,  
      active_nodes: [],
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
            name : '/UI_launcher/launch',
            serviceType : 'test_pkg/launch'
        });
        this.stop_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI_launcher/stop',
            serviceType : 'test_pkg/launch'
        });
    },

    launch_start(launcher_id){
      this.global_launching = true
      console.log(this.launchers[launcher_id].name)
        var request = new ROSLIB.ServiceRequest({
            pkg : this.launchers[launcher_id].pkg,
            file : this.launchers[launcher_id].file
        });
    
        this.launch_service.callService(request, (result) => {
            console.log('Result for service call on ' + this.launch_service.name + ': ' + result.success);
            this.launchers[launcher_id].active = 'orange'
        });
        
        this.check_started(launcher_id)
    },

    launch_stop(launcher_id){
      this.global_launching = true
      console.log(this.launchers[launcher_id].name)
        var request = new ROSLIB.ServiceRequest({
            pkg : this.launchers[launcher_id].pkg,
            file : this.launchers[launcher_id].file
        });
    
        this.stop_service.callService(request, (result) => {
            console.log('Result for service call on ' + this.launch_service.name + ': ' + result.success);
            this.launchers[launcher_id].active = 'orange';
        });

        setTimeout(() => {
            this.ros.getNodes((nodes) => {
                var killed = true;
                for (let i = 0; i < this.launchers[launcher_id].nodes.length; i++) {
                    console.log(this.launchers[launcher_id].nodes[i])
                    console.log(nodes)
                    if (nodes.includes(this.launchers[launcher_id].nodes[i])){
                        killed = false;
                        break; 
                    }
                }
                if (killed){
                    this.launchers[launcher_id].active = 'gray';
                    this.global_launching = false
                }
            });
        }, 2500)
    },

    check_started(launcher_id){
        this.ros.getNodes((nodes) => {
            var started = true;
            for (let i = 0; i < this.launchers[launcher_id].nodes.length; i++) {
                console.log(this.launchers[launcher_id].nodes[i])
                console.log(nodes)
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
            else {
            console.log("Call function again")
            setTimeout(() => {
                this.check_started(launcher_id) 
            }, 500)
        };
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
      this.init_services()
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
    padding: 1px;
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
    width: 160px;
    font-size: 20px;
    margin-right: 30px;
    text-align: right;
}
button{
    width: 120px;
    height: 50px;
    font-size: 16px;
    margin: 10px;
    border: 1px solid #1d1b31;
    border-radius: 5px;
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
</style>