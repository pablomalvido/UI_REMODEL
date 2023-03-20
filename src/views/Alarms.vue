<template>
  <div>
      <TitlePage page='Alarms'/>
  </div>
  <div id="activeAlarm">
    
  </div>
</template>

<script>
import TitlePage from '@/components/Title_page.vue';

export default {
    name: 'Alarms',

    components: {TitlePage},
    

    data(){
        return{
            
            alarm_title: "ALARMS",
            active_alarms: [],
            inactive_alarms: [],
            problems: {"robot": {"detected": false, "active": false}, "Estop": {"detected": false, "active": false}, "curtain": {"detected": false, "active": false}, "door": {"detected": false, "active": false}, "UI": {"detected": false, "active": false}, "vision": {"detected": false, "active": false}}
        }
    },

    methods: {

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