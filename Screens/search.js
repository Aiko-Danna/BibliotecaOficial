import React,{Component} from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import {Avatar, ListItem, Icon} from 'react-native-elements';
import db from '../Components/config';

const bg = require('../assets/fondo.png');
const logo = require('../assets/appIcon.png');

export default class SearchScreen extends Component{
  constructor(props){
    super(props);
    this.state={
      allTransactions:[],
      lastVisibleTransaction:null,
      searchText:''
    }
  }

  componentDidMount = async() =>{
    this.getTransactions();
  }

  getTransactions=()=>{
    db.collection('transactions')
    .limit(10)
    .get()
    .then(snapShot=>{
      snapShot.docs.map(doc=>{
        this.setState({
          allTransactions:[...this.state.allTransactions, 
          doc.data()],
          lastVisibleTransaction:doc})
      })
    })
  }

  renderItem=({item,i})=>{
    var date = item.date
    .toDate()
    .toString()
    .split('')
    .splice(0, 4)
    .join('')

    var transactionType = item.transaction_type === 'emitido' ? 'issue' : 'returned'

    return(
      <View style={{borderWidth:1}}>
        <ListItem key={i} bottomDivider>
          <Icon type={'antdesign'} name={'book'} size={40}/>
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {`${item.book_name} ( ${item.book_id} )`}
            </ListItem.Title>

            <ListItem.Subtitle style={styles.subtitle}>
              {`Este libro fue ${transactionType} por ( ${item.student_name} )`}
            </ListItem.Subtitle>

            <View style={styles.lowLeftContainer}>
              <View style={styles.transactionContainer}>
                <Text style={[
                  styles.transactionText, {color:item.transaction_type==='emitido' ? 
                '#78d304':'#0364f4'}]}>
                  {item.transaction_type.charAt(0).toUpperCase()+
                  item.transaction_type.slice(1)}
                </Text>

                <Icon
                  type={'ionicon'}
                  name={item.transaction_type==='emitido'? 'checkmark-circle-outline': 'arrow-redo-circle-outline'}
                  color={item.transaction_type==='emitido'? '#78d304': '#0364f4'} 
                />
              </View>
              <Text style={styles.date}>{date}</Text>

            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    )
  }

  handleSearch = async(text) =>{
    var enteredText = text.toUpperCase().split('')
    text=text.toUpperCase()
    this.setState({
      allTransactions:[]
    })

    if(!text){
      this.getTransactions
    }
    if(enteredText[0]==='f'){
      db.collection('transactions')
      .where('book_ID','==',text)
      .get()
      .then(snapShot=>{
        snapShot.doc.map(doc=>{
          this.setState({
            allTransactions:[...this.state.allTransactions, doc.data()]
          })
        })
      })
    }else if(enteredText[0]==='g'){
      db.collection('transactions')
      .where('student_ID','==',text)
      .get()
      .then(snapShot=>{
        snapShot.doc.map(doc=>{
          this.setState({
            allTransactions:[...this.state.allTransactions, doc.data()]
          })
        })
      })
    }
  }

  render(){
    const {searchText, allTransactions} = this.state;

    return(
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <View style={styles.textinputContainer}>
            <TextInput 
              style={styles.textInput}
              onChangeText={text=>{this.setState({searchText:text})}}
              placeholder={'Busca aquí'}
              placeholderTextColor={'#FFFFFF'}
            />
            <TouchableOpacity 
            style={styles.scanbutton} 
            onPress={()=>{
              this.handleSearch(searchText);
            }}>
               <Text style={styles.scanbuttonText}> Buscar</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.lowerContainer}>
          <FlatList
            data={allTransactions}
            renderItem={this.renderItem}
            keyExtractor={(item, index)=>
              index.toString()
            }
            onEndReached={()=>this.fetchMoreTransactions(searchText)}
            onEndReachedThreshold={0.7}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5653D4"
  },
  upperContainer: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  lowerContainer: {
    flex: 0.8,
    backgroundColor: "#FFFFFF"
  },
  title: {
    fontSize: 20,
    fontFamily: "Rajdhani_600SemiBold"
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Rajdhani_600SemiBold"
  },
  lowerLeftContainer: {
    alignSelf: "flex-end",
    marginTop: -40
  },
  transactionContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center"
  },
  transactionText: {
    fontSize: 20,

    fontFamily: "Rajdhani_600SemiBold"
  },
  date: {
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
    paddingTop: 5
  }
});