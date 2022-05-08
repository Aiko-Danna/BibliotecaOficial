import React,{Component} from 'react';
import { Text, View, StyleSheet } from 'react-native';
import LoginScreen from './Screens/login';
import SearchScreen from './Screens/search';

import { createSwitchNavigator, createAppContainer} from 'react-navigation';

import BottonTabNavigator from './Components/bottonTabNavigator';

import {
  useFonts,
  Rajdhani_300Light,
  Rajdhani_400Regular,
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';

import *as Font from 'expo-font'

export default class App extends Component{
  constructor(){
    super();
    this.state={
      fontLoaded:false
    }
  }

  async loadFonts(){
    await Font.loadAsync({
      Rajdhani_600SemiBold:Rajdhani_600SemiBold
    })

    this.setState({fontLoaded:true})
  }

  componentDidMount(){
    this.loadFonts();
  }

  render(){
    const {fontLoaded} = this.state
      if(fontLoaded)
        return(
          <AppContainer />
        )
      return null
  }
}

const AppSwitchNavigator = createSwitchNavigator(
  {
    Login: {
      screen: LoginScreen
    },
    BottomTab: {
      screen: BottonTabNavigator
    }
  },
  {
    initialRouteName: "Login"
  }
);

const AppContainer = createAppContainer(AppSwitchNavigator);
