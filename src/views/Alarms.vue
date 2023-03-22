<template>
  <div>
      <TitlePage page='Alarms'/>
  </div>
  <!-- <div id="activeAlarm">
    <h4>{{ rosCon }}</h4>
  </div> -->
</template>

<script>
import TitlePage from '@/components/Title_page.vue';
import VueSidebarMenuAkahon from '@/components/Sidebar-menu-akahon.vue';

export default {
    name: 'Alarms',
    props: ['rosCon'],

    components: {TitlePage},


    data(){
        return{
            rosCon: false,
            listener_reset: null,
            alarm_title: "ALARMS",
            active_alarms: [],
            inactive_alarms: [],
            problems: {"robot": {"detected": false, "active": false}, "Estop": {"detected": false, "active": false}, "curtain": {"detected": false, "active": false}, "door": {"detected": false, "active": false}, "UI": {"detected": false, "active": false}, "vision": {"detected": false, "active": false}}
        }
    },

    methods: {
        // init_subscribers(){

        // this.listener_reset = new ROSLIB.Topic({
        //     ros : this.ros,
        //     name : '/RSM/reset',  // /RSM/ROS_reset for tests
        //     messageType : 'std_msgs/Bool' //Change this for your topic type
        // });

    //     this.rviz_image1_topic = new ROSLIB.Topic({
    //     ros : this.ros,
    //     name : '/camera1/image/compressed',
    //     messageType : 'sensor_msgs/CompressedImage'
    //   });

    //   this.rviz_image1_topic.subscribe((message) => {
    //     //console.log('RVIZ image 1 updated');
    //     if (this.rviz_image1_topic.name == this.camera_selected){
    //       this.last_time = Date.now();
    //       this.rviz_image = "data:image/jpg;base64," + message.data;
    //     }
    //   });

    //   this.rviz_image2_topic = new ROSLIB.Topic({
    //     ros : this.ros,
    //     name : '/camera2/image/compressed',
    //     messageType : 'sensor_msgs/CompressedImage'
    //   });

    //   this.rviz_image2_topic.subscribe((message) => {
    //     //console.log('RVIZ image 2 updated');
    //     if (this.rviz_image2_topic.name == this.camera_selected){
    //       this.last_time = Date.now();
    //       this.rviz_image = "data:image/jpg;base64," + message.data;
    //     }
    //   });
    // },

        // if(rosCon == false){
        //         ros = new ROSLIB.Ros({
        //             url : 'ws://192.168.43.168:9090' //Port = 9090
        //         });

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

            // this.global_launching = true
            // this.getLaunchersState()
        },

    unmounted(){
            this.ros.close()
        }
    }

}


</script>

<style>

</style>