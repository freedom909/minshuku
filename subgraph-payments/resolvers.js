import errors from '../utils/errors.js';
const { AuthenticationError, ForbiddenError }=errors

const resolvers = { 
  Query: {
    payment:()=>123456
  },
  Mutation:{
    addFundsToWalletResponse: async ({amount},_,{dataSources,userId}) => {
      if(!userId) throw AuthenticationError()
      const user=await dataSources.userAPI.getUserById(userId);
      if(!user){
        throw new Error('User not found')
        };
        try{
          const updateWallet=await dataSources.walletAPI.addFunds({
            userId : user._id ,
            amount
            })
            return {
              status:'success',
              message:`${amount} added to wallet successfully`,
              amount:updateWallet.amount
            }
        }catch(error){
          console.log("error", error )
          return {
            code:400,
            error:"Invalid input",
          message:error.message
          }
        }
       
    }
},
Guest:{
  funds:async (_,__,{dataSources,userId}) => {
    const {amount}=await dataSources.paymentsAPI.getUserWalletAmount(
      userId
    )
    return amount
  }
}
}

export default resolvers;
