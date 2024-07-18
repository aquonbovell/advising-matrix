<script>
  import { Chart, Card, A, Button, Dropdown, DropdownItem, Popover, Tooltip } from 'flowbite-svelte';
  import { InfoCircleSolid, ArrowDownToBracketOutline, ChevronDownOutline, ChevronRightOutline, PenSolid, DownloadSolid, ShareNodesSolid } from 'flowbite-svelte-icons';

  export let id = "DonutChart";
  export let title = "Credits";
  export let description = "Credits of this category completed...";
  export let series = [50, 50];
  export let labels = ['Credits Completed', 'Credits Remaining'];

  const options = {
    series: series,
    colors: ['#272861', '#D6D6D6'],
    chart: {
      height: 320,
      width: '100%',
      type: 'donut'
    },
    stroke: {
      colors: ['transparent'],
      lineCap: ''
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: 'Inter, sans-serif',
              offsetY: 20
            },
            total: {
              showAlways: true,
              show: true,
              label: 'Unique visitors',
              fontFamily: 'Inter, sans-serif',
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
                return `${sum}k`;
              }
            },
            value: {
              show: true,
              fontFamily: 'Inter, sans-serif',
              offsetY: -20,
              formatter: function (value) {
                return value + 'k';
              }
            }
          },
          size: '80%'
        }
      }
    },
    grid: {
      padding: {
        top: -2
      }
    },
    labels: labels,
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + 'k';
        }
      }
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value + 'k';
        }
      },
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    }
  };
</script>

  <div class="flex justify-between items-start w-full">
    <div class="flex-col items-center">
      <div class="flex items-center mb-1">
        <h5 class="text-xl font-bold leading-none text-gray-900  me-1">{title}</h5>
        <InfoCircleSolid id="donut1" class="w-3.5 h-3.5 text-gray-500  hover:text-gray-900  cursor-pointer ms-1" />
        <Popover triggeredBy="#donut1" class="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm w-72 z-10">
          <div class="p-3 space-y-2">
            {description}
            <A href="/">Read more <ChevronRightOutline class="w-2 h-2 ms-1.5" /></A>
          </div>
        </Popover>
      </div>
    </div>
    <div class="flex justify-end items-center">
      <ArrowDownToBracketOutline class="w-3.5 h-3.5" />
      <Tooltip>Download CSV</Tooltip>
    </div>
  </div>

  <Chart {options} class="py-6" />
