import { and, rule, shield } from "graphql-shield";

const isAuthenticated=rule()((_,__,{user}) => {
    return user!==null
})

const isAdmin=rule()((_,__,{user,role})=>{
    return user?.role==="admin"
})
const isUpdatingOwnLibrary=rule()((_,{input:{userId}},{user})=>{
    return user?.sub===userId
})

const isDeletingOwnLibrary=rule()((_,{input:{userId}},{user})=>{
    return user?.sub===userId
})

const permissions=shield({
    Query:{
        library:rule()(and(isAuthenticated,rule(["admin"])(isUpdatingOwnLibrary))),
        libraries:isAuthenticated,
        user:isAuthenticated,
        me:isAuthenticated,
        searchPeople:isAuthenticated,
      
    },
    Mutation:{
        createAuthor:isAuthenticated,
        createRole:isAdmin,
        createUser:isAuthenticated,
        updateAuthor:isAdmin,
        updateRole:isAdmin,
        updateUser:isAuthenticated,
        deleteAuthor:isAdmin,
        deleteRole:isAdmin,
        deleteUser:isAuthenticated,
    }
})
export default permissions;