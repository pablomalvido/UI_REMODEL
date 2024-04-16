<template>
    <div>
      <TitlePage page='Contact-REMODEL'/>
    </div>
    
    <h1>Check out the REMODEL online handles and repositories here</h1>

    <div id="icon_layout_container">        
        <div id="icon_layout">
            <a href="https://remodel-project.eu/" target="_blank"><img src="../assets/img/REMODEL.png" alt="REMODEL- Website" id="logo_remodel"></a>
            <a href="https://www.youtube.com/channel/UC5hbRiWoe10-mlsg5pCgGRQ?app=desktop" target="_blank"> <img src="../assets/img/youtube.png" alt="REMODEL- Youtube channel" class="logo"> </a>
            <a href="https://twitter.com/remodel_h2020?lang=en" target="_blank"><img src="../assets/img/twitter.png" alt="REMODEL- Twitter Handle" class="logo"></a>
            <a href="https://tecnalia365.sharepoint.com/sites/sp078284/Shared%20Documents/Forms/AllItems.aspx?cid=c93a5d7b%2D8bbb%2D4cdb%2D8484%2Dadb0e1a1245a&RootFolder=%2Fsites%2Fsp078284%2FShared%20Documents%2FDocument%20Library&FolderCTID=0x012000709E9D1143CFC8418D0AE85818C53A15" target="_blank"><img src="../assets/img/sharepoint.png" alt="REMODEL- Sharepoint Repository" class="logo"></a>
            
            
            <!-- <div id="logo_remodel"><a href="https://remodel-project.eu/"><img src="../assets/img/REMODEL.jpg" alt="REMODEL- Website" id="logo_remodel"></a></div> -->
            <!-- <a href="https://dei-gitlab.dei.unibo.it/palli_group"><img src="../assets/img/gitlab.png" alt="REMODEL- Palli group-GitLab" class="logo"></a> -->
            <a href="https://dei-gitlab.dei.unibo.it/palli_group" target="_blank"><img src="../assets/img/gitlab.png" alt="REMODEL- Palli group-GitLab" id="logoGit"></a>
        </div><br>
    </div>
    <h2 id="h2_add">For more information, you can contact the developer</h2><br>
    <div id="coordinator_info">
        
        <div id="Contact information">
            <img src="../assets/img/project_coordinator.png" alt="Gianluca Palli- Coordinator" id="logo_coordinator" href="https://remodel-project.eu/">
        </div>
        <div id="coordinator_details">
            <br>
            <h2 id="h2_coord"><u>Pablo Malvido Fresnillo</u></h2>  
            <h3>Tampere University</h3>
            <h4>Future Automation Systems & Technologies Laboratory</h4><br>
            <p><strong>Email:</strong> <a href="pablo.malvidofresnillo@tuni.fi"> pablo.malvidofresnillo@tuni.fi</a></p><br>
            <p><strong>Telephone:</strong> +358 504656286</p>
        </div>
    </div>
    
</template>

<script>
import TitlePage from '@/components/Title_page.vue';

export default {
name: 'Contact-REMODEL',

components: {TitlePage},
}
</script>

<style scoped>
#icon_layout_container{
  
  margin-top: 3%;
  margin-left: 10%;
  min-width:60%;
  max-width: 100%;
  
}

#icon_layout {
  /* flex: 10%; */
  /* display: flexbox; */
  /* display: inline; */
  padding: 1px;
  overflow:auto;
  min-width:50%;
  max-width: 100%;
}
.logo{
    margin: 3%;
    /* flex: 0; */
    width:10%;
    height:10%;
    min-width:10%;
    max-width:50%;
    object-fit: cover;
}
#logo_remodel{
    margin: 3%;
    /* flex: 0; */
    width:15%;
    height:25%;
    padding-bottom: 2.5%;
    min-width:15%;
    max-width: 50%;
    object-fit: cover;
    /* border-radius: 15% 15% 40% 30%; */
    /* border-radius: 45%; */
}
#logoGit{
    margin: 3%;
    /* flex: 0; */
    padding-bottom: 2%;
    width:15%;
    height:15%;
    min-width:15%;
    max-width:50%;
    object-fit: cover;
}
#logo_coordinator{
    width:30%;
    height:100%;
    min-width:45%;
    object-fit: cover;
    margin-left: 45%;
}
#coordinator_info{
      
    /* margin-left: 10%;
    margin-top: 2%; */
  display: grid;
  /* grid-template-columns: repeat(2, 1fr); */
  grid-template-columns: 33% 67%;
  /* grid-template-rows: 100% 100%; */
  grid-gap: 1%;
    
}
#Project_Coordinator{
    justify-content: center;
    grid-column: 1 / 2;

}
#coordinator_details{
    grid-column: 2 / 3;
}
h1{
    margin-top: 5%;
    text-align: center;
}
#h2_add{
    text-align: center;
}

</style>