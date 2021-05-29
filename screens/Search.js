import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
//import { SafeAreaProvider } from 'react-native-safe-area-context';
import db from '../config';
import { ScrollView } from 'react-native-gesture-handler'

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search: '',
    };
  }

  // componentDidMount = async () => {
  //   const q = await db.collection('transation').get();
  //   q.docs.map((doc) => {
  //     this.setState({
  //       allTransactions: [...this.state.allTransactions, doc.data()],
  //       lastVisibleTransaction: doc
  //     })
  //   })
  // };
  searchTransactions = async (searchText) => {
    var text = searchText.toUpperCase()
    console.log( "our text : " + text )
    var enteredtext = text.split('')
    console.log( "Entered Text : " + enteredtext )

    if (enteredtext[0].toUpperCase() === 'B') {
      const t = await db
        .collection('transation')
        .where('bookId', '==', text)
        .limit(10)
        .get();

      t.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }

    else if (enteredtext[0].toUpperCase() === 'S') {
      const t = await db
        .collection('transation')
        .where('studenId', '==', text)
        .limit(10)
        .get();

      t.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }

    console.log(this.state.allTransactions.length);
  };

  fetchMoreTransactions = async () => {
    var text = this.state.search.toUpperCase();
    var enteredtext = text.split('');

    if (enteredtext[0].toUpperCase() === 'B') {
      const t = await db
        .collection('transation')
        .where('bookId', '==', text)
        .limit(10)
        .get();

      t.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
    }

    else if (enteredtext[0].toUpperCase() === 'S') {
      const t = await db
        .collection('transation')
        .where('studenId', '==', text)
        .limit(10)
        .get();

      t.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc,
        });
      });
      console.log(this.state.allTransactions.length);
    }





    // const query = await db
    //   .collection("transation")
    //   .startAfter(this.state.lastVisibleTransaction)
    //   .limit(10)
    //   .get()
    // query.docs.map((doc) => {
    //   this.setState({
    //     allTransactions: [...this.state.allTransactions, doc.data()],
    //     lastVisibleTransaction: doc
    //   })
    // })
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder='enter book or student id'
            style={styles.bar}
            onChangeText={(info) => {
              this.setState({
                search: info
              })
            }}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => {
            this.searchTransactions(this.state.search)
          }}>
            <Text>search</Text>
          </TouchableOpacity>
        </View>

        <FlatList data={this.state.allTransactions}
          renderItem={({ item }) => (
            <View style={{ borderWidth: 2, borderColor: 'coral', padding: 12, margin: 10 }}>
              <Text> {"Book Id : " + item.bookId}</Text>
              <Text> {"Student Id : " + item.studentId}</Text>
              <Text> {"Transaction Type : " + item.transationType}</Text>
              {/* <Text> {"Date : " + transaction.date.toDate()}</Text> */}
            </View>

          )}
          keyExtractor = { (item, index) => index.toString()}
          onEndReached = {() => {
            this.fetchMoreTransactions();
          }}
          onEndReachedThreshold = {0.7} />

      </View>


      // <ScrollView>
      //   {this.state.allTransactions.map((transaction, index) => {
      //     return (
      //       <View key={index} style={{ borderWidth: 2, borderColor: 'coral', padding: 12, margin: 10 }}>
      //         <Text> {"Book Id : " + transaction.bookId}</Text>
      //         <Text> {"Student Id : " + transaction.studentId}</Text>
      //         <Text> {"Transaction Type : " + transaction.transationType}</Text>
      //         {/* <Text> {"Date : " + transaction.date.toDate()}</Text> */}
      //       </View>
      //     )
      //   })
      //   }
      // </ScrollView>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    height: 40,
    width: 'auto',
    borderWidth: 0.5,
    alignItems: 'center',
    backgroundColor: '#ffe2e2',
  },
  bar: {
    borderWidth: 2,
    borderRadius: 6,
    height: 30,
    width: 300,
    paddingLeft: 20,
  },
  searchButton: {
    borderWidth: 1,
    height: 30,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14ffec',
    padding: 10,
    borderRadius: 8,
    margin: 10,
  },
});
