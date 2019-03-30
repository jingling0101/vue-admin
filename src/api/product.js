import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/product/list',
    method: 'get',
    params
  })
}

export function getProduct(params) {
  return request({
    url: '/product/get',
    method: 'get',
    params
  })
}

export function productDeleteList(params) {
  return request({
    url: '/product/del-list',
    method: 'get',
    params
  })
}

export function productCreate(params) {
  return request({
    url: '/product/create',
    method: 'post',
    data: params
  })
}

export function productEdit(params) {
  return request({
    url: '/product/edit',
    method: 'post',
    data: params
  })
}

export function productDelete(params) {
  return request({
    url: '/product/delete',
    method: 'post',
    data: params
  })
}


