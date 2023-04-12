import { IOClients } from '@vtex/api'

import { Checkout } from './Checkout'
import { AuthUser } from './AuthUser'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }

  public get authUser() {
    return this.getOrSet('authUser', AuthUser)
  }
}
