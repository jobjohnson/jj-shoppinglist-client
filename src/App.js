import React, { Component } from 'react';
import './App.css';
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Form from './Form';

const ShoppinglistsQuery = gql`query{
  shoppinglists{
    id
    text
    complete
  }
}`;

const UpdateShoppinglistMutation = gql`
  mutation($id: ID!, $complete: Boolean!){
    updateShoppinglist(id: $id, complete: $complete)
}`;
const RemoveShoppinglistMutation = gql`
  mutation($id: ID!){
    removeShoppinglist(id: $id)
}`;

const CreateShoppinglistMutation = gql`
  mutation($text: String!) {
    createShoppinglist(text: $text) {
      id
      text
      complete
    }
  }`;

class App extends Component {

  updateShoppinglist = async shoppinglist  => {
    //update
    await this.props.updateShoppinglist({
        variables: {
          id: shoppinglist.id,
          complete: !shoppinglist.complete
        },
    update: (store, { data: { updateShoppinglist} }) => {
      const data = store.readQuery({ query: ShoppinglistsQuery });
      data.shoppinglists = data.shoppinglists.map(
        x =>
          x.id === shoppinglist.id
            ? {
              ...shoppinglist,
              complete: !shoppinglist.complete
              }
              : x
      );
      store.writeQuery({ query: ShoppinglistsQuery, data });
    }
      });
  };

  removeShoppinglist = async shoppinglist => {
    //remove 
    await this.props.removeShoppinglist({
      variables: {
        id: shoppinglist.id
      },
  update: (store, { data: { removeShoppinglist} }) => {
    const data = store.readQuery({ query: ShoppinglistsQuery });
    data.shoppinglists = data.shoppinglists.filter(
      x => x.id !== shoppinglist.id
    );
    store.writeQuery({ query: ShoppinglistsQuery, data });
  }
    });
};

createShoppinglist = async text => {
  //create 
  await this.props.createShoppinglist({
    variables: {
      text
    },
update: (store, { data: { createShoppinglist } }) => {
  const data = store.readQuery({ query: ShoppinglistsQuery });
  data.shoppinglists.unshift(
    createShoppinglist
  );
  store.writeQuery({ query: ShoppinglistsQuery, data });
}
  });
};

  render() {
    const {
      data: { loading, shoppinglists }
    } = this.props;
    if (loading) {
      return null;
    }
    return (
      //
        <Paper elevation={1}>
        <Form submit={this.createShoppinglist} />
        <List>
        {shoppinglists.map(shoppinglist => (
          <ListItem key={`${shoppinglist.id}-shoppinglist-item`} role={undefined} dense button onClick={() => this.updateShoppinglist(shoppinglist)}>
            <Checkbox
              checked={shoppinglist.complete}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={shoppinglist.text} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => this.removeShoppinglist(shoppinglist)}>
                <CloseIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

        </Paper>
      //
    );
  }
}

export default compose(
graphql(CreateShoppinglistMutation, { name: "createShoppinglist"}),
graphql(RemoveShoppinglistMutation, { name: "removeShoppinglist"}),
graphql(UpdateShoppinglistMutation, { name: "updateShoppinglist" }), 
graphql(ShoppinglistsQuery)
)(App);
