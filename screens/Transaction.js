import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, Alert, KeyboardAvoidingView, ToastAndroid } from 'react-native'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import firebase from 'firebase'
import db from '../config'
export default class Transaction extends Component {
    constructor() {
        super();
        this.state = {
            hasCameraPermission: null,
            scanned: false,
            scannedData: '',
            buttonState: 'normal',
            scannedBookId: '',
            scannedStudentId: '',
            transactionMessage: ''
        }
    }
    handleBarCodeScanner = async ({ type, data }) => {
        // this.setState({
        //     scanned: true,
        //     scannedData: data,
        //     buttonState: 'normal',
        // })
        const { buttonState } = this.state
        if (buttonState === 'bookId') {
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'
            })
        }
        else if (buttonState) {
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'

            })
        }
    }
    getCameraPerissions = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA)
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        this.setState({
            hasCameraPermission: status === "granted",
            scanned: false,
            buttonState: id
        })
    }
    handleTransaction = async () => {
        var transactionType = await this.checkBookAvailability();
        //console.log(transactionType);
        if (!transactionType) {
            alert('Book does not exist in library db');
            this.setState({
                scannedBookId: '',
                scannedStudentId: '',
            });
        }
        else if (transactionType === 'Issue') {
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
            if (isStudentEligible) {
                this.initiateBookIssue();
                alert('Book Issued');
            }
        }
        else if (transactionType === 'Return') {
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            //console.log(isStudentEligible)
            if (isStudentEligible) {
                this.initiateBookReturn();
                alert('Book returned');
            }
        }
        // console.log("Demo")
        // var transactionMsg = null;
        // db.collection("books").doc(this.state.scannedBookId).get()
        //     .then((doc) => {
        //         console.log(doc.data())
        //         var book = doc.data();
        //         if (book.bookAvailability) {
        //             this.initiateBookIssue();
        //             transactionMsg = "Book Issued"
        //             ToastAndroid.show(transactionMsg,ToastAndroid.SHORT)
        //         }
        //         else {
        //             this.initiateBookReturn();
        //             transactionMsg = "Book returned";
        //             ToastAndroid.show(transactionMsg,ToastAndroid.SHORT)
        //         }
        //     })
        // this.setState({
        //     transactionMessage: transactionMsg
        // })

    }

    checkBookAvailability = async () => {
        const bookref = await db
            .collection("books")
            .where('bookId', '==', this.state.scannedBookId)
            .get();

        var transactionType = '';
        if (bookref.docs.length == 0) {
            transactionType = false;
        }
        else {
            bookref.docs.map((doc) => {
                var book = doc.data();
                if (book.bookAvailability) {
                    transactionType = 'Issue'
                }
                else {
                    transactionType = 'Return'
                }
            })
        }
        return transactionType;
    }
    checkStudentEligibilityForBookIssue = async () => {
        const studentref = await db.collection('students')
            .where('studentId', '==', this.state.scannedStudentId)
            .get();
            var studenteligible ='';
            if(studentref.docs.length ==0){
                studenteligible = false;
            
            this.setState({
                scannedStudentId: '',
                scannedBookId: ''
            })
            alert('no such student')
        }
        else(
            studentref.docs.map( (doc)=>{
                var student=doc.data()
                if(student.noOfBooksIssued<2){
                      studenteligible=true
                }
                else{
                    studenteligible=false
                    alert('already student have 2 books')
                    this.setState({
                        scannedStudentId: '',
                        scannedBookId: ''
                    })
                }
            })
        )
        return  studenteligible;
    }
    checkStudentEligibilityForBookReturn = async () => {
        const transationref = await db.collection('transation')
            .where('bookId', '==', this.state.scannedBookId)
            .limit(1)
            .get();
            var studenteligible ='';
             transationref.docs.map((doc)=>{
                 var lastbooktransaction=doc.data()
                 if(lastbooktransaction.studentId===this.state.scannedStudentId){
                     studenteligible=true
                 }
                 else{
                     studenteligible=false
                     this.setState({
                         scannedBookId:'',
                         scannedStudentId:''
                     })
                     alert('book was issued by another student')
                 }
             })   
        return  studenteligible;
    }
    

    initiateBookIssue = async () => {
        db.collection("transation").add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transationType': 'Issue'
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability': false
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            'noOfBooksIssued': firebase.firestore.FieldValue.increment(1)
        })
        // Alert.alert('book issued')
        this.setState({
            scannedStudentId: '',
            scannedBookId: ''
        })
    }
    initiateBookReturn = async () => {
        db.collection("transation").add({
            'studentId': this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transationType': 'Return'
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability': true
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            'noOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
        })
        //  Alert.alert('book returned')
        this.setState({
            scannedStudentId: '',
            scannedBookId: ''
        })
    }
    render() {
        const hasCameraPermission = this.state.hasCameraPermission
        const scanned = this.state.scanned
        const buttonState = this.state.buttonState
        if (buttonState !== 'normal' && hasCameraPermission) {
            return (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanner}
                    style={StyleSheet.absoluteFillObject} />
            )
        }
        else if (buttonState === 'normal') {
            return (
                <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
                    <View>
                        <View>
                            <Image
                                source={require('../assets/booklogo.jpg')}
                                style={{ width: 200, height: 200 }}
                            />
                            <Text style={{ textAlign: 'center', fontsize: 30 }}>WILY</Text>
                        </View>
                        <View style={styles.inputView}>
                            <TextInput
                                placeholder='bookid'
                                style={styles.inputBox}
                                onChangeText={(text) => {
                                    this.setState({
                                        scannedBookId: text
                                    })
                                }}
                                value={this.state.scannedBookId}
                            />
                            <TouchableOpacity style={styles.scanButton} onPress={() => {
                                this.getCameraPerissions('BookId')
                            }}>
                                <Text style={styles.buttonText}>
                                    SCAN
                              </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputView}>
                            <TextInput
                                placeholder='studentid'
                                style={styles.inputBox}
                                onChangeText={(st) => {
                                    this.setState({
                                        scannedStudentId: st
                                    })
                                }}
                                value={this.state.scannedStudentId}
                            />
                            <TouchableOpacity style={styles.scanButton} onPress={() => {
                                this.getCameraPerissions('StudentId')
                            }}>
                                <Text style={styles.buttonText}>
                                    SCAN
                              </Text>
                            </TouchableOpacity>

                        </View>
                        <TouchableOpacity style={styles.submitButton} onPress={() => {
                            this.handleTransaction()
                        }}>
                            <Text style={styles.submitButtonText}>SUBMIT</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )
        }
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    displayText: {
        fontSize: 15,
        textDecorationLine: 'underline'
    },
    scanButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        margin: 10
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10
    },
    inputView: {
        flexDirection: 'row',
        margin: 20
    },
    inputBox: {
        width: 200,
        height: 40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
    },
    scanButton: {
        backgroundColor: '#66BB6A',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0
    },
    submitButton: {
        backgroundColor: '#FBC02D',
        width: 170,
        height: 40,
        borderRadius: 10
    },
    submitButtonText: {
        padding: 10,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: "bold",
        color: 'white'
    }
});