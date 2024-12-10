<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { CustomerService } from '@/services_example/CustomerService'
import { useLayout } from '@/layouts/composables/layout'

const { layoutConfig } = useLayout()

const customersTable = ref(null)
const customersTable1 = ref(null)
const customersTable2 = ref(null)
const selectedVisitorYear = ref(null)
const selectedRevenueMonth = ref(null)
const selectedOrderYear = ref(null)
const selectedCustomers1 = ref(null)
const selectedCustomerYear = ref(null)
const customerMax = ref('1232')
const customerMin = ref('284')
const customerAvg = ref('875')
const customerCarousel = ref(null)
// const customerService = ref(null)
const visitorChart = ref(null)
const visitorChartOptions = ref(null)
const countryChartOptions = ref(null)
const revenueChartOptions = ref(null)
const customerChartOptions = ref(null)
const customerChart = ref(null)
const growth = ref('$620,076')
const avgCustomer = ref('$1,120')

const chartData1 = reactive({
  growth: '$620,076',
  avgCustomer: '$1,120'
})
const chartData2 = reactive({
  customerAvg: '875',
  customerMin: '284',
  customerMax: '1232'
})

const carouselResponsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 3
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 2
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1
  }
])

const timelineEvents = ref([
  { transaction: 'Payment from #28492', amount: '+$250.00', date: 'June 13, 2020 11:09 AM', icon: 'pi pi-check', iconColor: '#0F8BFD', amountColor: '#00D0DE' },
  { transaction: 'Process refund to #94830', amount: '-$570.00', date: 'June 13, 2020 08:22 AM', icon: 'pi pi-refresh', iconColor: '#FC6161', amountColor: '#FC6161' },
  { transaction: 'New 8 user to #5849', amount: '+$50.00', date: 'June 12, 2020 02:56 PM', icon: 'pi pi-plus', iconColor: '#0BD18A', amountColor: '#0BD18A' },
  { transaction: 'Payment from #3382', amount: '+$3830.00', date: 'June 11, 2020 06:11 AM', icon: 'pi pi-check', iconColor: '#0F8BFD', amountColor: '#00D0DE' },
  { transaction: 'Payment from #4738', amount: '+$845.00', date: 'June 11, 2020 03:50 AM', icon: 'pi pi-check', iconColor: '#0F8BFD', amountColor: '#00D0DE' },
  { transaction: 'Payment failed form #60958', amount: '$1450.00', date: 'June 10, 2020 07:54 PM', icon: 'pi pi-exclamation-triangle', iconColor: '#EC4DBC', amountColor: '#EC4DBC' },
  { transaction: 'Payment from #5748', amount: '+$50.00', date: 'June 09, 2020 11:37 PM', icon: 'pi pi-check', iconColor: '#0F8BFD', amountColor: '#00D0DE' },
  { transaction: 'Removed 32 users from #5849', amount: '-$240.00', date: 'June 09, 2020 08:40 PM', icon: 'pi pi-minus', iconColor: '#FC6161', amountColor: '#FC6161' }
])

const countryChart = ref({
  labels: ['RUS', 'Other', 'IND', 'AUS', 'JPN', 'USA', 'CHN'],
  datasets: [
    {
      data: [30, 18, 36, 54, 61, 90, 72],
      backgroundColor: ['#0F8BFD', '#545C6B', '#EC4DBC', '#EEE500', '#FC6161', '#00D0DE', '#873EFE'],
      hoverBackgroundColor: ['#0F8BFD', '#545C6B', '#EC4DBC', '#EEE500', '#FC6161', '#00D0DE', '#873EFE'],
      borderColor: 'transparent',
      fill: true
    }
  ]
})

const revenueChart = ref({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sales',
      data: [37, 34, 21, 27, 10, 18, 15],
      borderColor: '#EEE500',
      pointBackgroundColor: '#EEE500',
      backgroundColor: 'rgba(238, 229, 0, 0.05)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Revenue',
      data: [31, 27, 30, 37, 23, 29, 20],
      borderColor: '#00D0DE',
      pointBackgroundColor: '#00D0DE',
      backgroundColor: 'rgba(0, 208, 222, 0.05)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Expenses',
      data: [21, 7, 13, 3, 19, 11, 6],
      borderColor: '#FC6161',
      pointBackgroundColor: '#FC6161',
      backgroundColor: 'rgba(253, 72, 74, 0.05)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Customer',
      data: [47, 31, 35, 20, 46, 39, 25],
      borderColor: '#0F8BFD',
      pointBackgroundColor: '#0F8BFD',
      backgroundColor: 'rgba(15, 139, 253, 0.05)',
      fill: true,
      tension: 0.4
    }
  ]
})

const orderYear = ref([
  { name: '2021', code: '0' },
  { name: '2020', code: '1' }
])
const visitorYear = ref([
  { name: '2020', code: '0' },
  { name: '2019', code: '1' }
])
const customerYear = ref([
  { name: '2020', code: '0' },
  { name: '2019', code: '1' }
])
const revenueMonth = ref([
  { name: 'January - July 2021', code: '0' },
  { name: 'August - December 2020', code: '1' }
])

const customerService = new CustomerService()
async function initChart() {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--text-color')

  visitorChart.value = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Plan',
        data: [630, 630, 695, 695, 695, 760, 760, 760, 840, 840, 840, 840],
        borderColor: ['#FC6161'],
        pointBorderColor: 'transparent',
        pointBackgroundColor: 'transparent',
        type: 'line',
        fill: false,
        barPercentage: 0.5,
        stepped: true
      },
      {
        label: 'Growth actual',
        data: [600, 671, 660, 665, 700, 610, 810, 790, 710, 860, 810, 780],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-color'),
        fill: true,
        barPercentage: 0.5
      }
    ]
  }
  visitorChartOptions.value = {
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: textColor
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    hover: {
      mode: 'index'
    },
    scales: {
      y: {
        ticks: {
          color: textColor
        },
        min: 500,
        max: 900,
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          color: textColor
        },
        barPercentage: 0.5,
        grid: {
          display: false
        }
      }
    }
  }
  countryChartOptions.value = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    }
  }

  revenueChartOptions.value = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    responsive: true,
    hover: {
      mode: 'index'
    },
    scales: {
      x: {
        ticks: {
          color: textColor
        }
      },
      y: {
        ticks: {
          color: textColor,
          min: 0,
          max: 60,
          stepSize: 5
        }
      }
    }
  }
  customerChartOptions.value = {
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        ticks: {
          color: textColor
        },
        display: false
      },
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          display: false
        }
      }
    }
  }
  customersTable.value = await customerService.getCustomersLarge()
  customersTable.value.forEach(customer => (customer.date = new Date(customer.date)))

  customersTable1.value = await customerService.getCustomersLarge()
  customersTable1.value.forEach(customer => (customer.date = new Date(customer.date)))

  customersTable2.value = await customerService.getCustomersMixed()
  customersTable2.value.forEach(customer => (customer.date = new Date(customer.date)))

  selectedVisitorYear.value = visitorYear.value[0]
  selectedOrderYear.value = orderYear.value[0]
  selectedCustomerYear.value = customerYear.value[0]
  selectedRevenueMonth.value = revenueMonth.value[0]

  customerCarousel.value = [
    { user: '9,673 Users', value: '$8,362,478', image: 'nasa' },
    { user: '9,395 Users', value: '$7,927,105', image: 'beats' },
    { user: '7,813 Users', value: '$6,471,594', image: 'gopro' },
    { user: '7,613 Users', value: '$5,697,883', image: 'north' },
    { user: '98,673 Users', value: '$7,653,311', image: 'mc' },
    { user: '5,645 Users', value: '$4,567,823', image: 'dell' },
    { user: '5,153 Users', value: '$5,342,678', image: 'wwf' },
    { user: '4,338 Users', value: '$5,867,391', image: 'bmw' },
    { user: '4,170 Users', value: '$4,647,233', image: 'pepsi' },
    { user: '3,765 Users', value: '$4,123,876', image: 'netflix' },
    { user: '3,490 Users', value: '$3,688,362', image: 'deloitte' },
    { user: '2,976 Users', value: '$3,978,478', image: 'pg' }
  ]
  customerChart.value = {
    labels: ['January', 'March', 'May', 'Agust', 'October', 'December'],
    datasets: [
      {
        data: [10, 25, 48, 35, 54, 70],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [18, 35, 23, 30, 59, 65],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [20, 47, 46, 46, 61, 70],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [17, 34, 18, 48, 67, 68],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-600'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [9, 37, 47, 50, 60, 62],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [8, 48, 40, 52, 72, 75],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-200'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [10, 18, 50, 47, 63, 80],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-200'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [20, 36, 39, 58, 59, 85],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [30, 45, 35, 50, 54, 81],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [28, 35, 52, 56, 60, 77],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-200'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [40, 40, 38, 45, 68, 86],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-600'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [50, 23, 27, 34, 65, 90],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [29, 27, 29, 42, 55, 84],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [10, 37, 47, 29, 59, 80],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [10, 54, 42, 38, 63, 83],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-200'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [25, 44, 50, 56, 65, 92],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-200'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [30, 43, 48, 45, 73, 78],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-300'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      },
      {
        data: [29, 47, 54, 60, 77, 86],
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-400'),
        hoverBackgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-500'),
        fill: true,
        categoryPercentage: 1.0,
        barPercentage: 1.0
      }
    ]
  }
}

onMounted(() => {
  initChart()
})

watch(layoutConfig.theme, () => {
  initChart()
})
watch(layoutConfig.colorScheme, () => {
  initChart()
})

function changeRevenueChart(event) {
  const dataSet1 = [
    [37, 34, 21, 27, 10, 18, 15],
    [31, 27, 30, 37, 23, 29, 20],
    [21, 7, 13, 3, 19, 11, 6],
    [47, 31, 35, 20, 46, 39, 25]
  ]
  const dataSet2 = [
    [31, 27, 30, 37, 23, 29, 20],
    [47, 31, 35, 20, 46, 39, 25],
    [37, 34, 21, 27, 10, 18, 15],
    [21, 7, 13, 3, 19, 11, 6]
  ]
  if (event.value.code === '1') {
    revenueChart.value.datasets[0].data = dataSet2[Number.parseInt('0')]
    revenueChart.value.datasets[1].data = dataSet2[Number.parseInt('1')]
    revenueChart.value.datasets[2].data = dataSet2[Number.parseInt('2')]
    revenueChart.value.datasets[3].data = dataSet2[Number.parseInt('3')]
  }
  else {
    revenueChart.value.datasets[0].data = dataSet1[Number.parseInt('0')]
    revenueChart.value.datasets[1].data = dataSet1[Number.parseInt('1')]
    revenueChart.value.datasets[2].data = dataSet1[Number.parseInt('2')]
    revenueChart.value.datasets[3].data = dataSet1[Number.parseInt('3')]
  }
}

function changeVisitorChart(event) {
  const dataSet1 = [
    [630, 630, 695, 695, 695, 760, 760, 760, 840, 840, 840, 840],
    [600, 671, 660, 665, 700, 610, 810, 790, 710, 860, 810, 780]
  ]
  const dataSet2 = [
    [580, 580, 620, 620, 620, 680, 680, 680, 730, 730, 730, 730],
    [550, 592, 600, 605, 630, 649, 660, 690, 710, 720, 730, 780]
  ]
  if (event.value.code === '1') {
    chartData1.growth = '$581,259'
    chartData1.avgCustomer = '$973'
    visitorChart.value.datasets[0].data = dataSet2[Number.parseInt('0')]
    visitorChart.value.datasets[1].data = dataSet2[Number.parseInt('1')]
  }
  else {
    chartData1.growth = '$620,076'
    chartData1.avgCustomer = '$1,120'
    visitorChart.value.datasets[0].data = dataSet1[Number.parseInt('0')]
    visitorChart.value.datasets[1].data = dataSet1[Number.parseInt('1')]
  }
}
function changeCustomerChart(event) {
  const dataSet1 = [
    [10, 25, 48, 35, 54, 70],
    [18, 35, 23, 30, 59, 65],
    [20, 47, 46, 46, 61, 70],
    [17, 34, 18, 48, 67, 68],
    [9, 37, 47, 50, 60, 62],
    [8, 48, 40, 52, 72, 75],
    [10, 18, 50, 47, 63, 80],
    [20, 36, 39, 58, 59, 85],
    [30, 45, 35, 50, 54, 81],
    [28, 35, 52, 56, 60, 77],
    [40, 40, 38, 45, 68, 86],
    [50, 23, 27, 34, 65, 90],
    [29, 27, 29, 42, 55, 84],
    [10, 37, 47, 29, 59, 80],
    [10, 54, 42, 38, 63, 83],
    [25, 44, 50, 56, 65, 92],
    [30, 43, 48, 45, 73, 78],
    [29, 47, 54, 60, 77, 86]
  ]
  const dataSet2 = [
    [10, 25, 48, 35, 54, 70],
    [20, 47, 46, 46, 61, 70],
    [17, 34, 18, 48, 67, 68],
    [50, 23, 27, 34, 65, 90],
    [8, 48, 40, 52, 72, 75],
    [9, 37, 47, 50, 60, 62],
    [10, 18, 50, 47, 63, 80],
    [30, 45, 35, 50, 54, 81],
    [10, 37, 47, 29, 59, 80],
    [28, 35, 52, 56, 60, 77],
    [25, 44, 50, 56, 65, 92],
    [18, 35, 23, 30, 59, 65],
    [20, 36, 39, 58, 59, 85],
    [29, 27, 29, 42, 55, 84],
    [40, 40, 38, 45, 68, 86],
    [30, 43, 48, 45, 73, 78],
    [10, 54, 42, 38, 63, 83],
    [29, 47, 54, 60, 77, 86]
  ]
  if (event.value.code === '1') {
    chartData2.customerAvg = '621'
    chartData2.customerMin = '198'
    chartData2.customerMax = '957'
    customerChart.value.datasets[0].data = dataSet2[Number.parseInt('0')]
    customerChart.value.datasets[1].data = dataSet2[Number.parseInt('1')]
    customerChart.value.datasets[2].data = dataSet2[Number.parseInt('2')]
    customerChart.value.datasets[3].data = dataSet2[Number.parseInt('3')]
  }
  else {
    chartData2.customerAvg = '875'
    chartData2.customerMin = '284'
    chartData2.customerMax = '1232'
    customerChart.value.datasets[0].data = dataSet1[Number.parseInt('0')]
    customerChart.value.datasets[1].data = dataSet1[Number.parseInt('1')]
    customerChart.value.datasets[2].data = dataSet1[Number.parseInt('2')]
    customerChart.value.datasets[3].data = dataSet1[Number.parseInt('3')]
  }
}
function recentSales(event) {
  if (event.value.code === '0') {
    customersTable.value = customersTable1.value
  }
  else {
    customersTable.value = customersTable2.value
  }
}

function formatDate(value) {
  return value.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatCurrency(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <div class="grid">
    <div class="col-12 md:col-3">
      <div class="card relative h-6rem border-round-xl p-3">
        <span class="text-sm font-medium line-height-1"> CONVERSATION RATE </span>
        <div class="flex justify-content-between">
          <div class="flex justify-content-between align-items-center">
            <div class="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3" style="background-color: #fc6161; box-shadow: 0px 6px 20px rgba(252, 97, 97, 0.3)">
              <i class="pi pi-arrow-down w-2rem" />
              <span class="line-height-2">0.6%</span>
            </div>
            <div class="line-height-4 text-4xl">
              0.81%
            </div>
          </div>
        </div>
        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/rate.svg">
      </div>
    </div>
    <div class="col-12 md:col-3">
      <div class="card relative h-6rem border-round-xl p-3">
        <span class="text-sm font-medium line-height-1"> CONVERSATION RATE </span>
        <div class="flex justify-content-between">
          <div class="flex justify-content-between align-items-center">
            <div class="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3" style="background-color: #fc6161; box-shadow: 0px 6px 20px rgba(252, 97, 97, 0.3)">
              <i class="pi pi-arrow-down w-2rem" />
              <span class="line-height-2">0.6%</span>
            </div>
            <div class="line-height-4 text-4xl">
              0.81%
            </div>
          </div>
        </div>
        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/rate.svg">
      </div>
    </div>
    <div class="col-12 md:col-3">
      <div class="card relative h-6rem border-round-xl p-3">
        <span class="text-sm font-medium line-height-1"> AVG. ORDER VALUE </span>
        <div class="flex justify-content-between">
          <div class="flex justify-content-between align-items-center">
            <div class="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3" style="margin-right: 12px; background-color: #0bd18a; box-shadow: 0px 6px 20px rgba(11, 209, 138, 0.3)">
              <i class="pi pi-arrow-up w-2rem" />
              <span class="line-height-2">4,2%</span>
            </div>
            <div class="line-height-4 text-4xl">
              $306.2
            </div>
          </div>
        </div>
        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/value.svg">
      </div>
    </div>
    <div class="col-12 md:col-3">
      <div class="card relative h-6rem border-round-xl p-3">
        <span class="text-sm font-medium line-height-1"> ORDER QUANTITY </span>
        <div class="flex justify-content-between">
          <div class="flex justify-content-between align-items-center">
            <div class="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3" style="background-color: #00d0de; box-shadow: 0px 6px 20px rgba(0, 208, 222, 0.3)">
              <i class="pi pi-minus w-2rem" />
              <span class="line-height-2">2,1%</span>
            </div>
            <div class="line-height-4 text-4xl">
              1,620
            </div>
          </div>
        </div>
        <img class="absolute" style="bottom: 14px; right: 12px" src="/demo/images/ecommerce-dashboard/quantity.svg">
      </div>
    </div>

    <div class="col-12 md:col-8">
      <div class="card widget-visitor-graph">
        <div class="card-header line-height-4">
          <span>Unique visitor graph</span>
          <Dropdown v-model="selectedVisitorYear" :options="visitorYear" option-label="name" @change="changeVisitorChart($event)" />
        </div>

        <div class="graph-content grid mt-4">
          <div class="col-12 md:col-6">
            <h2>{{ growth }}</h2>
            <h6 class="mt-3">
              MRR GROWTH
            </h6>
            <p class="text-color-secondary">
              Measure how fast you’re growing mothly recurring revenue. <a href="#" class="text-primary hover:text-primary-400 transition-duration-200">Learn more</a>
            </p>
          </div>
          <div class="col-12 md:col-6">
            <h2>{{ avgCustomer }}</h2>
            <h6 class="mt-3">
              AVG. MRR/CUSTOMER
            </h6>
            <p class="text-color-secondary">
              The revenue generated per account on a monthly or yearly basis. <a href="#" class="text-primary hover:text-primary-400 transition-duration-200">Learn more</a>
            </p>
          </div>
        </div>

        <div class="graph">
          <h6 class="mt-4">
            Revenue
          </h6>

          <Chart id="visitor-chart" ref="visitor" type="bar" :height="490" :data="visitorChart" :options="visitorChartOptions" />
        </div>
      </div>
    </div>

    <div class="col-12 md:col-4">
      <div class="card p-0">
        <div class="timeline-header p-3 flex justify-content-between align-items-center">
          <p class="m-0">
            Transaction history
          </p>
          <div class="header-icons">
            <i class="pi pi-refresh ml-2" />
            <i class="pi pi-filter ml-2" />
          </div>
        </div>
        <div class="timeline-content pb-3">
          <Timeline :value="timelineEvents" class="customized-timeline py-0 px-3">
            <template #marker="slotProps">
              <span class="border-circle p-1 w-2rem h-2rem flex justify-content-center align-items-center" :style="{ backgroundColor: slotProps.item.iconColor }">
                <i :class="slotProps.item.icon" />
              </span>
            </template>
            <template #content="slotProps">
              <div class="flex align-items-center justify-content-between">
                <p class="m-0">
                  {{ slotProps.item.transaction }}
                </p>
                <h6 class="m-0" :style="{ color: slotProps.item.amountColor }">
                  {{ slotProps.item.amount }}
                </h6>
              </div>
              <span class="text-sm text-color-secondary">{{ slotProps.item.date }}</span>
            </template>
          </Timeline>
        </div>
        <div class="timeline-footer border-top-1 surface-border p-3 flex align-items-center justify-content-center">
          <a href="#" class="text-primary hover:text-primary-400 transition-duration-200">View all transactions<i class="pi pi-arrow-down" /></a>
        </div>
      </div>
    </div>

    <div class="col-12 md:col-4">
      <div class="card">
        <div class="font-medium line-height-4">
          Country distrubutions
        </div>
        <div class="country-graph">
          <div class="flex justify-content-center">
            <Chart id="country-chart" type="doughnut" :height="345" :data="countryChart" :options="countryChartOptions" class="w-9" />
          </div>
        </div>
        <div class="country-content">
          <ul class="m-0 p-0 border-none outline-none list-none">
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--cyan-400); box-shadow: 0px 0px 10px rgba(0, 208, 222, 0.3)" />
                <span>United States of America</span>
              </div>
              <span>25%</span>
            </li>
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--purple-400); box-shadow: 0px 0px 10px rgba(135, 62, 254, 0.3)" />
                <span>China</span>
              </div>
              <span>20%</span>
            </li>
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--red-400); box-shadow: 0px 0px 10px rgba(252, 97, 97, 0.3)" />
                <span>Japan</span>
              </div>
              <span>17%</span>
            </li>
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--yellow-400); box-shadow: 0px 0px 10px rgba(238, 229, 0, 0.3)" />
                <span>Australia</span>
              </div>
              <span>15%</span>
            </li>
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--pink-400); box-shadow: 0px 0px 10px rgba(236, 77, 188, 0.3)" />
                <span>India</span>
              </div>
              <span>10%</span>
            </li>
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--blue-400); box-shadow: 0px 0px 10px rgba(15, 139, 253, 0.3)" />
                <span>Rusian Federation</span>
              </div>
              <span>8%</span>
            </li>
            <li class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
              <div class="flex justify-content-between align-items-center">
                <div class="w-2rem h-2rem border-round mr-2" style="background-color: var(--gray-400)" />
                <span>Others</span>
              </div>
              <span>5%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-12 md:col-8">
      <div class="card">
        <div class="card-header line-height-4">
          <span>Montly revenue</span>
          <Dropdown v-model="selectedRevenueMonth" :options="revenueMonth" option-label="name" @change="changeRevenueChart($event)" />
        </div>

        <div class="graph">
          <Chart id="revenue-chart" type="line" :height="426" :data="revenueChart" :options="revenueChartOptions" />
        </div>
      </div>
    </div>

    <div class="col-12 md:col-8">
      <div class="card widget-table">
        <div class="card-header">
          <span>Yearly win</span>
          <Dropdown v-model="selectedOrderYear" :options="orderYear" option-label="name" @change="recentSales($event)" />
        </div>
        <DataTable ref="dt" :value="customersTable" :selection="selectedCustomers1" data-key="id" :row-hover="true" :rows="10" :paginator="true">
          <Column field="agent" header="Agent" sortable style="min-width: 14rem">
            <template #body="{ data }">
              <img :alt="data.representative.name" :src="`/demo/images/avatar/${data.representative.image}`" width="24" class="mr-2" style="vertical-align: middle">
              <span class="image-text">{{ data.representative.name }}</span>
            </template>
          </Column>
          <Column field="country.name" header="Country" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <span class="ml-2" style="vertical-align: middle">{{ data.country.name }}</span>
            </template>
          </Column>
          <Column field="date" header="Date" sortable>
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>
          <Column field="balance" header="Balance" sortable>
            <template #body="{ data }">
              {{ formatCurrency(data.balance) }}
            </template>
          </Column>
          <Column header-style="width: 8em" body-style="text-align: center">
            <template #body>
              <Button text icon="pi pi-copy" />
              <Button text icon="pi pi-pencil" />
              <Button text icon="pi pi-ellipsis-h" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div class="col-12 md:col-4">
      <div class="card widget-performance">
        <div class="header line-height-4 font-medium">
          <span>Quarterly win</span>
          <p class="text-sm text-color-secondary">
            Top performances
          </p>
        </div>
        <div class="content">
          <ul class="p-0 m-0 list-none">
            <li class="py-3 px-0 flex align-items-center">
              <Avatar v-badge="1" image="/demo/images/ecommerce-dashboard/ann.png" class="mr-2 w-3rem h-3rem" shape="circle" />
              <div class="ml-2">
                <div class="text-xl text-color">
                  $94,815
                </div>
                <div class="text-sm text-color-secondary">
                  Ann Vaccaro
                </div>
              </div>
            </li>
            <li class="py-3 px-0 flex align-items-center">
              <Avatar v-badge="2" image="/demo/images/ecommerce-dashboard/miracle.png" class="mr-2 w-3rem h-3rem" shape="circle" />
              <div class="ml-2">
                <div class="text-xl text-color">
                  $78,985
                </div>
                <div class="text-sm text-color-secondary">
                  Miracle Aminoff
                </div>
              </div>
            </li>
            <li class="py-3 px-0 flex align-items-center">
              <Avatar v-badge="3" image="/demo/images/ecommerce-dashboard/kaylynn.png" class="mr-2 w-3rem h-3rem" shape="circle" />
              <div class="ml-2">
                <div class="text-xl text-color">
                  $53,611
                </div>
                <div class="text-sm text-color-secondary">
                  Kaylynn Geidt
                </div>
              </div>
            </li>
            <li class="py-3 px-0 flex align-items-center">
              <Avatar v-badge="4" image="/demo/images/ecommerce-dashboard/angel.png" class="mr-2 w-3rem h-3rem" shape="circle" />
              <div class="ml-2">
                <div class="text-xl text-color">
                  $25,338
                </div>
                <div class="text-sm text-color-secondary">
                  Angel Rosser
                </div>
              </div>
            </li>
            <li class="py-3 px-0 flex align-items-center">
              <Avatar v-badge="5" image="/demo/images/ecommerce-dashboard/cristofer.png" class="mr-2 w-3rem h-3rem" shape="circle" />
              <div class="ml-2">
                <div class="text-xl text-color">
                  $15,989
                </div>
                <div class="text-sm text-color-secondary">
                  Cristofer Mango
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-12 lg:col-8">
      <div class="card widget-customer-graph">
        <div class="header">
          <div class="flex justify-content-between line-height-4">
            <span>Weekly new customers</span>
            <Dropdown v-model="selectedCustomerYear" :options="customerYear" option-label="name" @change="changeCustomerChart($event)" />
          </div>
          <p class="text-sm text-color-secondary">
            Number of new customer are listed by weekly
          </p>
        </div>

        <div class="content grid p-nogutter mt-3">
          <div class="col-12 md:col-6 grid">
            <div class="col-12 md:col-4 flex align-items-center">
              <h2 class="mb-0">
                {{ customerMax }}
              </h2>
              <p class="ml-2 text-color-secondary text-sm line-height-1">
                MAX
              </p>
            </div>
            <div class="col-12 md:col-4 flex align-items-center">
              <h2 class="mb-0">
                {{ customerMin }}
              </h2>
              <p class="ml-2 text-color-secondary text-sm line-height-1">
                MIN
              </p>
            </div>
            <div class="col-12 md:col-4 flex align-items-center">
              <h2 class="mb-0" style="color: #fc6161">
                {{ customerAvg }}
              </h2>
              <p class="ml-2 text-color-secondary text-sm line-height-1">
                AVARAGE
              </p>
            </div>
          </div>
        </div>

        <Chart id="customer-chart" ref="customer" :height="426" type="bar" :data="customerChart" :options="customerChartOptions" />
      </div>
    </div>

    <div class="col-12 lg:col-4">
      <div class="card widget-target">
        <div class="card-header">
          <span>Weekly target</span>
        </div>
        <div class="content">
          <h3 class="mt-3 mb-0">
            1232 Users
          </h3>
          <span class="text-sm line-height-1 text-green-500">%3.5 <i class="pi pi-arrow-up text-sm" /><span class="text-color-secondary"> than last week</span></span>
        </div>
        <div class="mt-4 relative text-red-500 flex flex-column justify-content-between" style="min-height: 235px">
          <div class="item mb-3">
            <span class="block mb-1">51%</span>
            <ProgressBar
              :value="51"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#FC6161' } },
              }"
            />
            <span class="day bottom-0 text-color-secondary block mt-1">Thu</span>
          </div>
          <div class="item mb-3">
            <span class="block mb-1">68%</span>
            <ProgressBar
              :value="68"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#FC6161' } },
              }"
            />
            <span class="day bottom-0 text-color-secondary block mt-1">Fri</span>
          </div>
          <div class="item mb-3">
            <span class="block mb-1">74%</span>
            <ProgressBar
              :value="74"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#FC6161' } },
              }"
            />
            <span class="day bottom-0 text-color-secondary block mt-1">Sat</span>
          </div>
          <div class="item mb-3">
            <span class="block mb-1">61%</span>
            <ProgressBar
              color="#FC6161"
              :value="61"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#FC6161' } },
              }"
            />
            <span class="day bottom-0 text-color-secondary block mt-1">Sun</span>
          </div>
          <div class="item success mb-3">
            <span class="block mb-1 text-green-500">100%</span>
            <ProgressBar
              :value="100"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#0BD18A', boxShadow: '0px 0px 10px rgb(11 209 138 / 30%)' } },
              }"
            />
            <span class="day bottom-0 text-color-secondary block mt-1">Mon</span>
          </div>
          <div class="item mb-3">
            <span class="block mb-1">70%</span>
            <ProgressBar
              :value="70"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#FC6161' } },
              }"
            />
            <span class="day bottom-0 text-color-secondary block mt-1">Tue</span>
          </div>
          <div class="item today mb-3">
            <span class="block mb-1">22%</span>
            <ProgressBar
              :value="22"
              :show-value="false"
              :pt="{
                value: { style: { backgroundColor: '#FC6161' } },
              }"
            />
            <span class="day bottom-0 text-color block mt-1">Today</span>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 widget-customer-carousel">
      <h6>Top customers</h6>
      <Carousel :value="customerCarousel" :num-visible="4" :num-scroll="1" :circular="true" :responsive-options="carouselResponsiveOptions" indicators-content-class="hidden">
        <template #item="slotProps">
          <div class="card mr-4">
            <div class="customer-item-content text-center">
              <div class="mb-6">
                <img :src="`/demo/images/ecommerce-dashboard/${slotProps.data.image}.png`" :alt="slotProps.data.image" class="product-image">
              </div>
              <div>
                <h4>{{ slotProps.data.user }}</h4>
                <h5 class="mt-0 mb-3 text-color-secondary">
                  {{ slotProps.data.value }}
                </h5>
              </div>
            </div>
          </div>
        </template>
      </Carousel>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.customized-timeline) {
    .p-timeline-event:nth-child(even) {
        flex-direction: row !important;

        .p-timeline-event-content {
            text-align: left !important;
        }
    }

    .p-timeline-event-opposite {
        flex: 0;
        padding: 0;
    }

    .p-card {
        margin-top: 1rem;
    }
}
</style>
