// @flow
import { AsyncStorage } from 'react-native'

export const storeAsyncData = async (key: string, data: string) => {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key')
    }
    if (typeof data !== 'string') {
      throw new Error('Invalid data')
    }
    return await AsyncStorage.setItem(key, data)
  } catch (error) {
    throw error
  }
}

export const fetchAsyncData = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key)
  } catch (error) {
    throw error
  }
}

export const removeAsyncData = async (key: string) => {
  try {
    return await AsyncStorage.removeItem(key)
  } catch (error) {
    throw error
  }
}
