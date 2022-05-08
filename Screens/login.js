import React,{Component} from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, TextInput, Image, ImageBackground, ToastAndroid, KeyboardAvoidingView } from 'react-native';
import db from '../Components/config';
import firebase from 'firebase';

const bg = require('../assets/fondo.png');
const logo = require('../assets/appIcon.png');

export default class LoginScreen extends Component{
  constructor(props){
    super(props);
    this.state={
      email:'',
      password:''
    }
  }

  handleLogin=(email, password) =>{
    firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(()=>{
      this.props.navigation.navigate('BottomTab')
    })
    .catch(error=>{Alert.alert('Vuelva a intentar logearse')})
  }

  render(){
    const {email, password} = this.state;
    return(
      <KeyboardAvoidingView>
        <ImageBackground source={bg} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={logo} style={styles.appIcon}></Image>
          </View>

          <View>
            <TextInput 
            style={styles.textinput}
            onChangeText={text=>{this.setState({email:text})}}
            placeholder={'Ingresa aquí tu email'}
            placeholderTextColor={'#e97500'}
            autoFocus
            />

            <TextInput 
            style={styles.textinput}
            onChangeText={text=>{this.setState({password:text})}}
            placeholder={'Ingresa aquí tu contraseña'}
            placeholderTextColor={'#e97500'}
            secureTextEntry
            />

            <TouchableOpacity 
            style={styles.button}
            onPress={()=>this.handleLogin(email, password)}
            >
            <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  appIcon:{
    width:200,
    height:220,
    margin:40,
    marginTop:50,   
  },
  bgImage:{
    flex:1,
    height:800,
    alignItems:"center",
  },
  textinput:{
    borderWidth:2,
    borderRadius:5,
    borderColor:'black',
    backgroundColor:'white',  
    width:200,
    height:30,
    margin:10
  },
  button:{
    width:100,
    height:50,
    backgroundColor:'#b1fff4',
    borderRadius:10,
    justifyContent:'center',
    borderWidth:2,
    textAlign:'center',
    margin:20,
    alignSelf:'center'
  },
})