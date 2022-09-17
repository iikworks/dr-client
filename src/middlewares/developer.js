export default function guest ({ next, store }){
  if (store.getters.getToken == null){
    return next({
      name: 'Home'
    })
  }

  if (store.getters.getUser.employee != 999) {
    return next({
      name: 'Home'
    })
  }

  return next()
}
