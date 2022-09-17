export default function guest ({ next, store }){
  if(store.getters.getToken == null){
    return next({
      name: 'Login'
    })
  }

  return next()
}
