import React,{Component} from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, TextInput, Image, ImageBackground, ToastAndroid, KeyboardAvoidingView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from '../Components/config';
import firebase from 'firebase';

const bg = require('../assets/fondo.png');
const logo = require('../assets/appIcon.png');

export default class TransitionScreen extends Component{
  constructor(){
    super();
    this.state={
      modoEscaneo:"normal",
      permisosCamara:null,
      escaneado:false,
      datosEscaneados:'',
      bookId:'',
      studentId:'',
      domState:'normal',
      bookName:'',
      studentName:''
    }
  }

  getCameraPermissions = async (domState) =>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA);

    if(status==="granted"){
      this.setState({
        permisosCamara: status==="granted",
        domState: domState,
        escaneado: false,
      })
    }else{
      Alert.alert("No se otorgó el permiso")
    }
  }

  handleBarCodeScaned = async({type, data}) =>{
    this.setState({escaneado:true, datosEscaneados:data, modoEscaneo:"normal"})
  }

  handleTransaction = async() =>{
    var {bookId, studentId} = this.state
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    var transactionType = await this.checkBookAvailability(bookId);

    if(! transactionType){
       this.setState({bookId:'', studentId:''})
       alert('No existe el libro en la biblioteca')
    }else if(transactionType === 'emitido'){
      var isEligible = await this.checkStudentEligibilityIssue(studentId)
      if(isEligible){
        var {bookName, studentName} = this.state
        this.initializeBookIssue(bookId, studentId, bookName, studentName);
        ToastAndroid.show('Libro entregado al alumno', ToastAndroid.SHORT);
      }else{
        var isEligible = await this.checkStudentEligibilityReturn(bookId, studentId);
        if(isEligible){
          var {bookName, studentName} = this.state
          this.initializeBookReturn(bookId, studentId, bookName, studentName);
          ToastAndroid.show('Libro devuelto a la biblioteca', ToastAndroid.SHORT)
        }
      }
    }
  }

  initializeBookIssue = async(bookId, studentId, bookName, studentName) =>{
    db.collection('transactions').add({
      book_ID:bookId,
      book_name:bookName,
      date:firebase.firestore.Timestamp.now().toDate(),
      student_ID:studentId,
      student_name:studentName,
      transaction_type:'emitido'
    })

    db.collection('books')
    .doc(bookId)
    .update({is_book_available:false})

    db.collection('students')
    .doc(studentId)
    .update({number_of_books_issued:firebase.firestore.FieldValue.increment(1)})

    this.setState({bookId:'', studentId:''})
  }
  
  initializeBookReturn = async(bookId, studentId, bookName, studentName) =>{
    db.collection('transactions').add({
      book_ID:bookId,
      book_name:bookName,
      date:firebase.firestore.Timestamp.now().toDate(),
      student_ID:studentId,
      student_name:studentName,
      transaction_type:'devuelto'
    })

    db.collection('books')
    .doc(bookId)
    .update({is_book_available:true})

    db.collection('students')
    .doc(studentId)
    .update({number_of_books_issued:firebase.firestore.FieldValue.increment(-1)})

    this.setState({bookId:'', studentId:''})
  }

  getBookDetails=(bookId)=>{
    var {bookName, studentName} = this.state
    bookId = bookId.trim();

    db.collection('books')
    .where('book_ID', '==', bookId)
    .get()
    .then(snapshot =>{snapshot.docs.map(doc=>{
      this.setState({bookName:doc.data().book_name})
    })})
  }

  getStudentDetails=(studentId)=>{
    var {bookName, studentName} = this.state
    studentId = studentId.trim();

    db.collection('students')
    .where('student_ID', '==', studentId)
    .get()
    .then(snapshot =>{snapshot.docs.map(doc=>{
      this.setState({studentName:doc.data().student_name})
    })})
  }

  checkBookAvailability = async(bookId) =>{
    const bookRef = await db
    .collection('books')
    .where('book_ID', '==', bookId)
    .get()
    var transactionType = ''

    if(bookRef.docs.length == 0){
      transactionType = false;
    }else{
      bookRef.docs.map(doc=>{
        transactionType = doc.data().is_book_available ? 
        'emitido' :
        'devuelto'
        })
    }

    return transactionType;
  }

  checkStudentEligibilityReturn = async(bookId, studentId) =>{
    const transactionRef = await db
    .collection('transactions')
    .where('book_ID', '==', bookId)
    .limit(1)
    .get()

    var isStudentEligible = ''

    transactionRef.docs.map(doc=>{
      var lastBookTransaction = doc.data();
      if(lastBookTransaction.student_ID === studentId){
        isStudentEligible = true;
      }else{
        isStudentEligible = false;
        alert('El libro no ha sido emitido al alumno');
        this.setState({bookId:'', studentId:''})
      }


    })

    return isStudentEligible
  }

  checkStudentEligibilityIssue = async(studentId) =>{
    const studentRef = await db
    .collection('students')
    .where('student_ID', '==', studentId)
    .get()

    var isStudentEligible = ''

    if(studentRef.docs.length === 0){
      this.setState({bookId:'', studentId:''})
      isStudentEligible = false;
      alert('El ID del alumno no existe')
    }else{
      studentRef.docs.map(doc=>{
        if(doc.data().number_of_books_issued <2){
          isStudentEligible = true;
        }else{
          isStudentEligible = false;
          alert('Ya tienes dos libros')
          this.setState({bookId:'', studentId:''})
        }
      })
    }

    return isStudentEligible;
  }

  render(){
    const{ modoEscaneo, permisosCamara, escaneado, datosEscaneados, bookId, studentId } = this.state;
    if(modoEscaneo==='scaner'){
      return(
        <BarCodeScanner
        onBarCodeScanned = {escaneado ? undefined : this.handleBarCodeScaned} 
        style={StyleSheet.absoluteFillObject}/>
      );
    }

    return(
      <KeyboardAvoidingView behavior='padding' style={styles.container}>
      <ImageBackground source={bg} style={styles.bgImage}>
      <View>
          <View style={styles.upperContainer}>
            <Image source={logo} style={styles.appIcon}/>
          </View>
        <View style={styles.lowerContainer}>
          <View style={styles.textInputContainer}>
            <TextInput 
            style={styles.textInput}
            placeholder={"ID del libro"}
            placeholderTextColor={"black"}
            value={bookId}
            onChangeText={text=> this.setState({ bookId:text})}/>
            <TouchableOpacity 
            style={styles.boton}
            onPress={()=>this.getCameraPermissions('bookId')}
            >
            <Text>Escanear</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.textInputContainer, {marginTop:25}]}>
            <TextInput 
            style={styles.textInput}
            placeholder={"ID del estudiante"}
            placeholderTextColor={"black"}
            value={studentId}
            onChangeText={text=> this.setState({ studentId:text})}/>
            <TouchableOpacity 
            style={styles.boton}
            onPress={()=>this.getCameraPermissions('studentId')}
            >
            <Text>Escanear</Text>
            </TouchableOpacity>
          </View>

          <View>
          <TouchableOpacity 
          style={styles.buttonSend}
          onPress={this.handleTransaction}>
          <Text>Enviar</Text>
          </TouchableOpacity>
          </View>
          
        </View>

      </View>
      
      </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  textInputContainer:{
    flexDirection:'row',
  },
  textInput:{
    borderWidth:2,
    borderBottomLeftRadius:10,
    borderTopLeftRadius:10,
    borderColor:'black',
    backgroundColor:'white',
  },

  lowerContainer:{
    flex:0.5,
    alignItems:'center',
  },
  boton:{
    width:100,
    height:50,
    backgroundColor:'#bf6ad2',
    borderTopRightRadius:10,
    borderBottomRightRadius:10,
    justifyContent:'center',
    borderWidth:2,
    borderLeftWidth:0,
    textAlign:'center',
  },
  container:{
    justifyContent:"center",
  },
  appIcon:{
    width:200,
    height:220,
    margin:40,
    marginTop:50,
  },
  bgImage:{
    flex:1,
    height:750,
    alignItems:"center",
  },
  buttonSend:{
    width:100,
    height:50,
    backgroundColor:'#b1fff4',
    borderRadius:10,
    justifyContent:'center',
    borderWidth:2,
    textAlign:'center',
    margin:30,
    alignSelf:'center'
  }
})