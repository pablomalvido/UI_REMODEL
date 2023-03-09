<template>
    <div>
      <TitlePage page='REMODEL UI - Login'/>
    </div>
  <div class="content">
        <div class= "login">
            <ul>
            <li>
            <label for="uname"><b>Username</b></label>
            </li>
            <li>
            <input type="text" placeholder="Enter Username" v-model="username">
            </li>
            <li>
            <label for="psw"><b>Password</b></label>
            </li>
            <li>
            <input type="password" placeholder="Enter Password" v-model="password">
            </li>
            </ul>
            <div class="center">
            <router-link to="/menu">
            <button @click="login()">Login</button>
            </router-link>
            </div>
        </div>
  </div>
</template>

<script>
import TitlePage from '@/components/Title_page.vue';
const CryptoJS = require("crypto-js");
import usersData from '@/assets/users.json'
//import adminData from '@/assets/test_file.txt'
// var fs = require('fs');

export default {
    name: 'Sensors',

    components: {TitlePage},

    data(){
        return{
        msg: 'Hellooo',
        rosCon: false,
        modeProp: '',
        username: '',
        password: '',
        users: usersData,
        login_bool: false,
        role: ''
        }
  },

  methods: {
    login(){
        // fs.readFile("@/assets/test_file.txt", (err, data) => {
        //     if (err) throw err;
        //     console.log(data.toString());
        // });

        // fetch('../assets/test_file.txt')
        //     .then(response => response.text())
        //     .then(text => console.log(text))

        // const fr = new FileReader();
        // fr.readAsText('@/assets/test_file.txt')
        // fr.addEventListener('load', ()=>{
        //     console.log(fr.result);
        // })

        // console.log(this.admin.username)

        // var encrypted = CryptoJS.AES.encrypt(this.password, this.password);
        for (let index = 0; index < this.users.length; index++) {
            if (this.users[index].username == this.username){
                var decrypted = CryptoJS.AES.decrypt(this.users[index].password, this.password);
                var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
                if (plaintext){
                    this.login_bool = true
                    this.role = this.users[index].role
                    this.$emit('login', [this.username, this.role])
                }
                break;
            }  
        }
    }
  }
}
</script>

<style scoped>
.content{
    position: relative;
    margin: 60px 10% 20px 20px;
    z-index: 200;
    overflow: scroll; 
    text-overflow: ellipsis;
    white-space: nowrap;
    /* text-align: center; */
    display: flex;
    align-items: center;
    justify-content: center;

}
.login{
    background-color: #716f8c;
    width: fit-content;
    padding: 18px;
    border-radius: 15px;
    border: 2px solid #1d1b31;
    color:white
}

.login label{
    margin-top: 10px;
    margin-bottom: 0px;
}

.login input{
    padding: 4px;
    width: 230px;
    border: 1px solid #1d1b31;
    border-radius: 3px;
}

ul {
    list-style-type: none;
}
li{
    margin: 5px;
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
.center{
    display: flex;
    justify-content: center;
    align-items: center;
}
button{
    margin-top: 25px;
    justify-self: center;
    width: 80px;
    height: 40px;
    font-size: 14px;
    border: 1px solid #1d1b31;
    border-radius: 5px;
}
</style>