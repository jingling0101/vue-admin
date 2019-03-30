<template>
  <div class="app-container">

    <div style="margin: 15px;width: 400px;">
      <el-button type="info" plain @click="delWhere">清空搜索条件</el-button>
    </div>

    <div style="margin: 15px;width: 600px;">
      <el-input v-model="key_word" placeholder="请输入内容" class="input-with-select">
        <template v-if="select_int_type === 1" slot="prepend">查找</template>
        <template v-if="select_int_type === 2" slot="prepend">按筛选条件查找</template>
        <el-button slot="append" icon="el-icon-search" @click="fetchSearchData"/>
      </el-input>

    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="id" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>

      <el-table-column label="商品名称" width="160">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="商品主图" width="100" align="center">
        <template slot-scope="scope">
          <span><img :src="scope.row.image" height="40px" width="40px"></span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="创建时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.updated_at }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="操作" width="120">
        <template slot-scope="scope">
          <i class="el-icon-delete" @click="confirmDel(scope.row.id)" > 删除</i>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="goToEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>

    </el-table>

    <div class="div-page">
      <el-pagination
        :page-sizes="[10,20,50,100]"
        :page-size="listQuery.single"
        :total="listQuery.total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"/>

    </div>

  </div>

</template>

<script>
import { getList, productDelete } from '@/api/product'

export default {
  filters: {
    isHotFilter(is_hot) {
      const statusMap = {
        1: 'danger',
        2: 'gray'
      }
      return statusMap[is_hot]
    },
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      isSearch: false,
      listLoading: true,
      key_word: '',
      select_int_type: 1,
      listQuery: {
        total: 0,
        page: 1,
        single: 10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    delWhere() {
      this.select_int_type = 1
      this.key_word = ''
      this.listQuery = {
        total: 0,
        page: 1,
        single: 10
      }
      this.fetchData()
    },
    confirmDel(id) {
      this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(id)
        this.deleteProduct(id)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      if (this.isSearch) {
        this.fetchSearchData()
      } else {
        this.fetchData()
      }
    },
    handleSizeChange(val) {
      this.listQuery.single = val
      if (this.isSearch) {
        this.fetchSearchData()
      } else {
        this.fetchData()
      }
    },
    deleteProduct(pid) {
      const form = {
        pid: pid
      }
      productDelete(form).then(response => {
        // --
        console.log(response)
        if (response.code === 20000) {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          for (const i in this.list) {
            if (this.list[i].id === pid) {
              const index = this.list.indexOf(this.list[i])
              // console.log(index)
              this.list.splice(index, 1)
              break
            }
          }
        } else {
          console.log(response.data)
          const err_msg = response.data.message
          this.$notify({
            title: '删除失败',
            message: err_msg,
            type: 'error',
            duration: 2000
          })
        }
      })
    },
    goToEdit(pid) {
      this.$router.push({
        name: 'product-edit',
        params: { pid: pid }
      })
    },
    fetchSearchData() {
      this.listLoading = true
      if (!this.isSearch) {
        this.listQuery.page = 1
        this.isSearch = true
      }
      this.listQuery.cate_parent = this.cate_parent
      this.listQuery.cate = this.cate
      this.listQuery.s_brand = this.s_brand
      this.listQuery.select_int_type = this.select_int_type

      this.listQuery.key_word = this.key_word
      // 1搜 商品名称
      this.listQuery.search_type = 1
      getList(this.listQuery).then(response => {
        this.list = response.data.products
        this.listQuery.total = response.pageInfo.total
        this.listQuery.single = response.pageInfo.single
        this.listQuery.page = response.pageInfo.page
        // console.log(response.data)
        this.listLoading = false
        if (this.listQuery.total <= this.listQuery.single) {
          this.isSearch = false
        }
      })
    },
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.products
        this.listQuery.total = response.pageInfo.total
        this.listQuery.single = response.pageInfo.single
        this.listQuery.page = response.pageInfo.page
        // console.log(response.data)
        this.listLoading = false
      })
    }
  }
}
</script>

<style>
  .div-page{
    margin: 20px auto;
  }
  .el-select .el-input {
    width: 130px;
  }

</style>
