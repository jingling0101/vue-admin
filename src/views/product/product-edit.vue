<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="商品名称">
        <el-input v-model="form.name" class="div-w-th"/>
      </el-form-item>
      <!--<el-form-item label="商品编号">-->
      <!--<el-input v-model="form.p_no" class="div-w-th"/>-->
      <!--</el-form-item>-->
      <el-form-item label="积分价格">
        <el-input v-model="form.product_price" type="number" class="div-w-th"/>
      </el-form-item>
      <!--<el-form-item label="是否出售">--><!--<el-switch v-model="form.is_sell_bool"/>-->
      <!--</el-form-item>-->
      <el-form-item label="详情">
        <el-input v-model="form.intro" type="textarea" class="div-w-fv"/>
      </el-form-item>

      <el-form-item label="商品主图"/>
      <div class="product-images">
        <el-row>
          <el-col :span="12">
            <div style="width: 160px;height: 160px;overflow: hidden">
              <el-upload
                :class="{disabled:uploadDisabled}"
                :file-list="fileList0"
                :action="post_path"
                :data="uData"
                :headers="uHeader"
                :before-upload="handleBeforeUp"
                :on-success="handleAvatarSuccess"
                :before-remove="handleBeforeRemove"
                :on-preview="handlePictureCardPreview"
                list-type="picture-card"
                class="avatar-uploader">
                <i class="el-icon-plus"/>
              </el-upload>
              <el-dialog :visible.sync="dialogVisible">
                <img :src="showImage" width="100%" alt="">
              </el-dialog>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="div-clear">
        <el-form-item label=""/>
      </div>

      <div class="div-step">
        <el-steps :active="1" simple>
          <el-step title="编辑商品信息" icon="el-icon-edit"/>
          <el-step title="步骤 2 上传图片" icon="el-icon-upload"/>
          <el-step title="步骤 3 保存" icon="el-icon-success"/>
        </el-steps>
      </div>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { getProduct, productEdit } from '@/api/product'
import { uploadProductUrl } from '@/api/url'

export default {
  data() {
    return {
      uHeader: {
        'x-token': getToken()
      },
      uData: {
        'img_fn_type': 100
      },
      // dialogVisible: false,
      post_path: uploadProductUrl(),
      showImage: '',
      imageUrl: '',
      imageUp: false,
      dialogVisible: false,
      pro_is_created: false,
      fileList0: [],
      form: {
        name: '',
        p_no: '',
        product_price: '',
        is_sell: 1,
        image_url: '',
        image_url_arr: '',
        intro: ''
      }
    }
  },
  computed: {
    uploadDisabled: function() {
      return this.imageUp
    }
  },
  created() {
    this.getProductByPid(this.$route.params)
  },
  methods: {
    getProductByPid(pid) {
      getProduct(pid).then(response => {
        if (response.code === 20000) {
          console.log(response.data)
          this.form.pid = response.data.id
          this.form.name = response.data.name
          this.form.brand_id = response.data.brand_id
          this.form.p_no = response.data.su_number
          this.form.image_url = response.data.image
          this.fileList0 = [{
            name: '0.jpeg',
            url: response.data.image
          }]
          this.form.product_price = response.data.product_price
          this.form.intro = response.data.intro
          this.imageUrl = response.data.image
        } else {
          // ---
        }
      })
    },
    uploadDisabledDesc: function(index) {
      if (this.imageUrlArr[index] !== '') {
        return 'disabled'
      } else {
        return ''
      }
    },
    proIsCreate() {
      this.pro_is_created = false
    },
    onSubmit() {
      const _this = this
      this.form.image_url = this.imageUrl
      this.form.image_url_arr = this.imageUrlArr
      console.log(this.form.image_url_arr)
      if (this.form.product_price < 0) {
        _this.$message({
          message: '商品积分价格不对',
          type: 'error'
        })
      }
      // if (this.form.is_sell_bool) {
      //   this.form.is_sell = 1
      // } else {
      //   this.form.is_sell = 2
      // }
      this.form.is_sell = 1
      console.log(this.form)
      if (!this.pro_is_created) {
        this.pro_is_created = true
        productEdit(this.form).then(response => {
          console.log(response)
          if (response.code === 20000) {
            _this.$message({
              message: '修改商品信息成功',
              type: 'success'
            })
            setTimeout(function() {
              _this.$router.push({
                name: 'soft-list'
              })
            }, 600)
          } else {
            _this.$message({
              message: response.message,
              type: 'error'
            })
            _this.pro_is_created = false
          }
          // ---
        }).catch()
        setInterval(this.proIsCreate, 5000)
      }
    },
    onCancel() {
      this.$router.push({
        name: 'product-list'
      })
    },
    handleBeforeUp() {
      this.imageUp = true
    },
    handleBeforeRemove() {
      this.imageUp = false
      this.imageUrl = ''
    },
    handlePictureCardPreview(file) {
      this.showImage = file.url
      this.dialogVisible = true
    },
    handleAvatarSuccess(res, file) {
      console.log(res)
      if (res.code && res.code === 20000) {
        // this.imageUrl = URL.createObjectURL(file.raw)
        this.imageUrl = res.data.img_path
      }
    },
    beforeAvatarUpload(file) {
      const isJPEG = file.type === 'image/jpeg'
      const isJPG = file.type === 'image/jpg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
        return false
      }
      if (isJPG || isJPEG || isPNG) {
        return true
      } else {
        this.$message.error('上传图片只能是 JPG , PNG 格式!')
        return false
      }
    }
    // --------------
  }
}
</script>

<style>

  .div-w-th{
    width: 300px;
  }
  .div-w-fv{
    width: 500px;
  }

  .line {
    text-align: center;
  }

  .disabled .el-upload--picture-card {
    display: none;
  }
  .div-clear {
    clear: both;
  }

  .div-step{
    margin: 20px auto;
  }

  .product-images {
    width: 600px;
    margin: 10px auto;
  }

</style>

