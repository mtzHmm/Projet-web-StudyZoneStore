import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { OrderStatus } from '../../models/order.interface';
import { forkJoin, interval, Subscription } from 'rxjs';
import { catchError, of, tap } from 'rxjs';

interface StatCard {
  title: string;
  value: string;
  percentage: string;
  isPositive: boolean;
  icon: string;
  viewReport: string;
}

interface RealStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

@Component({
  selector: 'app-stats',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class Stats implements OnInit, OnDestroy {
  
  // Loading and functionality states
  loading = true;
  error: string | null = null;
  lastUpdated = new Date();
  usingMockData = false;
  
  // Auto-refresh subscription
  private refreshSubscription?: Subscription;
  
  // Données des cartes statistiques (initialized with correct structure)
  statsCards: StatCard[] = [
    {
      title: 'Products in Stock',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '📦',
      viewReport: 'View Products'
    },
    {
      title: 'Out of Stock',
      value: '...',
      percentage: '...',
      isPositive: false,
      icon: '📊',
      viewReport: 'View Report'
    },
    {
      title: 'Pending Orders',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '📋',
      viewReport: 'View Pending'
    },
    {
      title: 'Orders Delivered',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '✅',
      viewReport: 'View Delivered'
    },
    {
      title: 'Total Revenue',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '💰',
      viewReport: 'View Revenue'
    },
    {
      title: 'Avg Product Value',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '📈',
      viewReport: 'View Details'
    },
    {
      title: 'Product Categories',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '📋',
      viewReport: 'View Categories'
    },
    {
      title: 'Total Products',
      value: '...',
      percentage: '...',
      isPositive: true,
      icon: '🎯',
      viewReport: 'View All'
    }
  ];

  // Données pour le graphique en ligne (sales per month - real data)
  chartData: { month: string; value: number }[] = [];
  salesMaxValue = 0; // For chart scaling

  // Données pour le pie chart
  pieChartData = [
    { name: 'T-Shirts', value: 45, color: '#4F46E5' },
    { name: 'Hoodies', value: 30, color: '#7C3AED' },
    { name: 'Accessories', value: 25, color: '#A855F7' }
  ];

  constructor(
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadRealStats();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private startAutoRefresh(): void {
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadRealStats();
    });
  }

  // Load real stats from backend
  loadRealStats(): void {
    console.log('📊 Loading real stats...');
    this.loading = true;
    this.error = null;
    
    // Try to fetch real data from backend
    this.fetchRealData().subscribe({
      next: (stats) => {
        console.log('✅ Real stats fetched successfully:', stats);
        this.updateStatsWithRealData(stats);
        this.usingMockData = false;
        this.loading = false;
        this.lastUpdated = new Date();
        console.log('✅ Stats updated with real data');
      },
      error: (error) => {
        console.error('❌ Failed to load real stats, using mock data:', error);
        this.loadMockData();
        this.usingMockData = true;
        this.loading = false;
        this.lastUpdated = new Date();
        console.warn('📊 Using mock data as fallback');
      }
    });
  }

  // Refresh stats data (public method for button)
  refreshStats(): void {
    this.loadRealStats();
  }

  // Fetch real data from mock data services
  private fetchRealData() {
    console.log('🔄 Starting real data fetch from mock services...');
    return forkJoin({
      products: this.productService.getProducts(0, 1000).pipe( // Get ALL products (up to 1000)
        tap(result => console.log('📦 Products fetched:', result.content?.length || 0, 'items')),
        catchError(err => {
          console.error('❌ Error fetching products:', err);
          return of({ content: [], totalElements: 0 });
        })
      ),
      // Get all orders for comprehensive analysis
      allOrders: this.orderService.getOrders(0, 1000).pipe(
        tap(result => {
          console.log('📋 All orders fetched:', result.orders?.length || 0, 'orders');
          if (result.orders) {
            console.log('📋 Order statuses:', result.orders.map(o => ({ id: o.id, status: o.status })));
          }
        }),
        catchError(err => {
          console.error('❌ Error fetching orders:', err);
          return of({ orders: [], totalElements: 0 });
        })
      )
    }).pipe(
      tap(fullData => console.log('✅ All data fetched successfully:', {
        products: fullData.products.content?.length || 0,
        allOrders: fullData.allOrders.orders?.length || 0
      })),
      catchError(error => {
        console.error('❌ Error in fetchRealData:', error);
        throw error;
      })
    );
  }

  // Update stats with real mock data
  private updateStatsWithRealData(data: any): void {
    const products = data.products.content || [];
    const allOrders = data.allOrders.orders || data.allOrders.content || data.allOrders || [];
    
    console.log('📊 Calculating stats from:', { products: products.length, orders: allOrders.length });
    
    // Product statistics
    const totalProducts = products.length;
    const inStockProducts = products.filter((p: any) => p.stock > 0).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    
    // Calculate total inventory value
    const totalInventoryValue = products.reduce((sum: number, product: any) => {
      return sum + (product.price * product.stock);
    }, 0);
    
    // Calculate average product price
    const averageProductPrice = totalProducts > 0 
      ? products.reduce((sum: number, p: any) => sum + p.price, 0) / totalProducts 
      : 0;
    
    // Order statistics
    const deliveredOrders = allOrders.filter((o: any) => 
      o.status === OrderStatus.DELIVERED || o.status === 'DELIVERED' || o.status === 'delivered'
    );
    
    const pendingOrders = allOrders.filter((o: any) => 
      o.status === OrderStatus.PENDING || o.status === 'PENDING' || o.status === 'pending'
    );
    
    // Calculate REAL revenue from delivered orders
    const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => {
      const orderItems = order.orderItems || [];
      const orderTotal = orderItems.reduce((itemSum: number, item: any) => {
        const itemPrice = item.product?.price || item.price || 0;
        const itemQuantity = item.quantity || 1;
        return itemSum + (itemPrice * itemQuantity);
      }, 0);
      return sum + orderTotal;
    }, 0);
    
    // Calculate unique categories
    const uniqueCategories = [...new Set(products.map((p: any) => p.category?.name).filter(Boolean))];
    
    const totalOrders = allOrders.length;
    
    console.log('💰 Calculated stats:', {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalRevenue,
      averageProductPrice,
      deliveredOrders: deliveredOrders.length,
      pendingOrders: pendingOrders.length,
      categories: uniqueCategories.length
    });
    
    // Update stats cards with real calculated data
    this.statsCards = [
      {
        title: 'Total Products',
        value: totalProducts.toString(),
        percentage: this.calculateGrowth(totalProducts, 15), // Compare to expected baseline
        isPositive: totalProducts >= 15,
        icon: '🎯',
        viewReport: 'View All'
      },
      {
        title: 'Products in Stock',
        value: inStockProducts.toString(),
        percentage: this.calculateGrowth(inStockProducts, totalProducts * 0.9), // 90% should be in stock
        isPositive: inStockProducts > totalProducts * 0.8,
        icon: '📦',
        viewReport: 'View Products'
      },
      {
        title: 'Out of Stock',
        value: outOfStockProducts.toString(),
        percentage: outOfStockProducts === 0 ? '0%' : this.calculateGrowth(outOfStockProducts, 1, true),
        isPositive: outOfStockProducts === 0,
        icon: '⚠️',
        viewReport: 'View Report'
      },
      {
        title: 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        percentage: this.calculateGrowth(totalRevenue, 100), // Compare to 100 DT baseline
        isPositive: totalRevenue > 0,
        icon: '💰',
        viewReport: 'View Revenue'
      },
      {
        title: 'Avg Product Price',
        value: this.formatCurrency(averageProductPrice),
        percentage: this.calculateGrowth(averageProductPrice, 50), // Compare to 50 DT baseline
        isPositive: averageProductPrice >= 30,
        icon: '📈',
        viewReport: 'View Details'
      },
      {
        title: 'Orders Delivered',
        value: deliveredOrders.length.toString(),
        percentage: this.calculateGrowth(deliveredOrders.length, Math.max(1, totalOrders * 0.5)),
        isPositive: deliveredOrders.length > 0,
        icon: '✅',
        viewReport: 'View Delivered'
      },
      {
        title: 'Pending Orders',
        value: pendingOrders.length.toString(),
        percentage: pendingOrders.length === 0 ? '0%' : this.calculateGrowth(pendingOrders.length, Math.max(1, totalOrders * 0.3)),
        isPositive: pendingOrders.length < totalOrders * 0.5, // Less pending is better
        icon: '📋',
        viewReport: 'View Pending'
      },
      {
        title: 'Product Categories',
        value: uniqueCategories.length.toString(),
        percentage: this.calculateGrowth(uniqueCategories.length, 4), // Compare to 4 categories baseline
        isPositive: uniqueCategories.length >= 4,
        icon: '📂',
        viewReport: 'View Categories'
      }
    ];

    // Update chart data with real sales data per month
    this.updateChartsWithRealData(products, allOrders);
  }

  // Load mock data as fallback (should not be needed since services return mock data)
  private loadMockData(): void {
    console.log('⚠️ Loading fallback mock data - this should not happen if services work correctly');
    
    // Initialize empty sales data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.chartData = months.map(month => ({ month, value: 0 }));
    this.salesMaxValue = 1; // Default minimum value
    
    // Update with placeholder values but keep the same structure as real data
    this.statsCards = [
      {
        title: 'Total Products',
        value: '0',
        percentage: '0%',
        isPositive: true,
        icon: '🎯',
        viewReport: 'View All'
      },
      {
        title: 'Products in Stock',
        value: '0',
        percentage: '0%',
        isPositive: true,
        icon: '📦',
        viewReport: 'View Products'
      },
      {
        title: 'Out of Stock',
        value: '0',
        percentage: '0%',
        isPositive: true,
        icon: '⚠️',
        viewReport: 'View Report'
      },
      {
        title: 'Total Revenue',
        value: '0 DT',
        percentage: '0%',
        isPositive: true,
        icon: '💰',
        viewReport: 'View Revenue'
      },
      {
        title: 'Avg Product Price',
        value: '0 DT',
        percentage: '0%',
        isPositive: true,
        icon: '📈',
        viewReport: 'View Details'
      },
      {
        title: 'Orders Delivered',
        value: '0',
        percentage: '0%',
        isPositive: true,
        icon: '✅',
        viewReport: 'View Delivered'
      },
      {
        title: 'Pending Orders',
        value: '0',
        percentage: '0%',
        isPositive: true,
        icon: '📋',
        viewReport: 'View Pending'
      },
      {
        title: 'Product Categories',
        value: '0',
        percentage: '0%',
        isPositive: true,
        icon: '📂',
        viewReport: 'View Categories'
      }
    ];
    this.error = null;
  }

  // Update charts with real product and sales data
  private updateChartsWithRealData(products: any[], orders: any[]): void {
    console.log('📊 Updating charts with real data...');
    console.log('📦 Products:', products.length);
    console.log('📋 Orders:', orders.length);

    // Calculate sales revenue per month from delivered orders
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth = new Array(12).fill(0);

    // Filter delivered orders and calculate revenue by month
    const deliveredOrders = orders.filter((order: any) => {
      const status = order.status;
      return status === OrderStatus.DELIVERED || status === 'DELIVERED' || status === 'delivered';
    });

    console.log('📈 Total orders received:', orders.length);
    console.log('📈 Delivered orders (sales):', deliveredOrders.length);
    console.log('📈 All order statuses:', orders.map(o => ({ id: o.id, status: o.status })));

    deliveredOrders.forEach((order: any) => {
      const orderDate = new Date(order.orderDate);
      console.log(`🗓️ Checking order #${order.id}: ${orderDate.toDateString()} (Year: ${orderDate.getFullYear()})`);
      
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.getMonth();
        
        // Calculate order revenue from order items
        const orderRevenue = order.orderItems?.reduce((sum: number, item: any) => {
          const itemPrice = item.product?.price || item.price || 0;
          const itemQuantity = item.quantity || 1;
          return sum + (itemPrice * itemQuantity);
        }, 0) || 0;
        
        salesByMonth[month] += orderRevenue;
        console.log(`💰 ✅ Revenue added to ${months[month]}: ${orderRevenue} DT from Order #${order.id} - Total for ${months[month]}: ${salesByMonth[month]} DT`);
      } else {
        console.log(`❌ Order #${order.id} not in current year ${currentYear}`);
      }
    });

    // Update chart data with real sales revenue
    this.chartData = months.map((month, index) => ({
      month,
      value: Math.round(salesByMonth[index] * 100) / 100 // Round to 2 decimal places
    }));

    // Calculate max value for chart scaling
    this.salesMaxValue = Math.max(...salesByMonth, 1); // Minimum 1 to avoid division by zero

    // Summary logging
    const totalSalesRevenue = salesByMonth.reduce((sum, revenue) => sum + revenue, 0);
    console.log('📊 === SALES REVENUE SUMMARY ===');
    console.log('📊 Final revenue per month (DT):', 
      months.map((month, index) => `${month}: ${salesByMonth[index].toFixed(2)}`).join(', '));
    console.log('📊 Total revenue in year:', totalSalesRevenue.toFixed(2), 'DT');
    console.log('📊 Chart data:', this.chartData);
    console.log('📈 Max revenue value for scaling:', this.salesMaxValue.toFixed(2), 'DT');
    console.log('📊 === END SUMMARY ===');

    // Create pie chart based on product categories
    const categoryGroups = products.reduce((acc: any, product: any) => {
      const category = product.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#4F46E5', '#7C3AED', '#A855F7', '#C084FC', '#DDD6FE'];
    this.pieChartData = Object.entries(categoryGroups)
      .slice(0, 5) // Limit to top 5 categories
      .map(([name, value], index) => ({
        name,
        value: value as number,
        color: colors[index] || '#6B7280'
      }));

    console.log('🥧 Pie chart data updated:', this.pieChartData);
  }

  // Helper methods for sales chart
  getSalesPointY(value: number): number {
    if (this.salesMaxValue === 0) return 180;
    // Scale value to fit in chart (20 to 180 range)
    return 180 - ((value / this.salesMaxValue) * 160);
  }

  generateSalesChartPoints(): string {
    if (this.chartData.length === 0) return '';
    
    return this.chartData.map((point, index) => {
      const x = 20 + (index * 32); // 32 pixels between points for 12 months
      const y = this.getSalesPointY(point.value);
      return `${x},${y}`;
    }).join(' ');
  }

  getTotalSalesCount(): number {
    return this.chartData.reduce((total, point) => total + point.value, 0);
  }

  getAverageSalesPerMonth(): number {
    const total = this.getTotalSalesCount();
    const average = this.chartData.length > 0 ? total / this.chartData.length : 0;
    return Math.round(average * 10) / 10; // Round to 1 decimal
  }

  getBestSalesMonth(): string {
    if (this.chartData.length === 0) return 'N/A';
    
    let maxValue = -1;
    let bestMonth = 'N/A';
    
    this.chartData.forEach(point => {
      if (point.value > maxValue) {
        maxValue = point.value;
        bestMonth = point.month;
      }
    });
    
    return maxValue > 0 ? bestMonth : 'N/A';
  }

  // Helper methods
  private calculateGrowth(current: number, previous: number, inverse = false): string {
    if (previous === 0) return '+0%';
    const growth = ((current - previous) / previous) * 100;
    const actualGrowth = inverse ? -growth : growth;
    return `${actualGrowth >= 0 ? '+' : ''}${actualGrowth.toFixed(1)}%`;
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M DT`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k DT`;
    }
    return `${amount.toFixed(0)} DT`;
  }

  // Navigate to detailed view (placeholder functionality)
  viewDetails(cardTitle: string): void {
    console.log(`Navigating to details for: ${cardTitle}`);
    // In a real app, you would navigate to specific pages
    alert(`Would navigate to ${cardTitle} details page`);
  }

  // Export stats data
  exportStats(): void {
    const statsData = {
      timestamp: this.lastUpdated,
      cards: this.statsCards,
      chartData: this.chartData,
      pieChartData: this.pieChartData
    };
    
    const dataStr = JSON.stringify(statsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Get formatted last updated time
  getLastUpdatedTime(): string {
    return this.lastUpdated.toLocaleTimeString();
  }

  // Handle chart point click
  onChartPointClick(monthData: any): void {
    alert(`${monthData.month}: ${monthData.value} sales`);
  }

  // Handle pie chart segment click
  onPieSegmentClick(segment: any): void {
    const percentage = this.getPercentage(segment.value);
    alert(`${segment.name}: ${segment.value} units (${percentage}%)`);
  }

  // Helper methods for template
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Math helper methods for template (Angular can't use Math directly)
  getSalesYAxisLabel(multiplier: number): number {
    return Math.round(this.salesMaxValue * multiplier);
  }

  // Fonction pour calculer le total des ventes
  getTotalSales(): number {
    return this.pieChartData.reduce((total, item) => total + item.value, 0);
  }

  // Fonction pour calculer le pourcentage de chaque segment
  getPercentage(value: number): number {
    return Math.round((value / this.getTotalSales()) * 100);
  }

  // Fonction pour calculer l'angle de départ et la longueur de l'arc pour chaque segment
  getArcData(index: number): { startAngle: number, endAngle: number, percentage: number } {
    const total = this.getTotalSales();
    let cumulativePercentage = 0;
    
    // Calculer le pourcentage cumulé jusqu'à l'index actuel
    for (let i = 0; i < index; i++) {
      cumulativePercentage += this.pieChartData[i].value;
    }
    
    const startAngle = (cumulativePercentage / total) * 360;
    const currentPercentage = (this.pieChartData[index].value / total) * 100;
    const endAngle = startAngle + (currentPercentage / 100) * 360;
    
    return {
      startAngle,
      endAngle,
      percentage: Math.round(currentPercentage)
    };
  }

  // Fonction pour calculer les paramètres SVG du segment
  getSegmentPath(index: number): string {
    const arcData = this.getArcData(index);
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    
    const startAngleRad = (arcData.startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (arcData.endAngle - 90) * (Math.PI / 180);
    
    const startX = centerX + radius * Math.cos(startAngleRad);
    const startY = centerY + radius * Math.sin(startAngleRad);
    const endX = centerX + radius * Math.cos(endAngleRad);
    const endY = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = arcData.endAngle - arcData.startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }
}
