
import {AuthenticationError, ForbiddenError} from '../utils/errors.js';
import { info } from 'console';


const requireAuth=(resolver)=>{
    return (_,__,context,info)=>{
        if (! context.userId) {
            throw new AuthenticationError()
        }
        return resolver(_,__,context,info)
    }
}


const requireRole = (role, resolver) => {
    return (parent, args, context, info) => {
      if (!context.userId) {
        throw new AuthenticationError();
      }
      if (context.userRole !== role) {
        throw new ForbiddenError(`You must be a ${role} to access this resource.`);
      }
      return resolver(parent, args, context, info);
    };
  };
export { requireAuth, requireRole };