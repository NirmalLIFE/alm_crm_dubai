import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-social-media-campaign-report',
    templateUrl: './social-media-campaign-report.component.html',
    styleUrls: ['./social-media-campaign-report.component.css'],
})
export class SocialMediaCampaignReportComponent implements OnInit {
    public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public selectedCampaign: any = '0';
    public selectedCustomers: any = '0';
    public totalCustomersData: any;

    appointment: any;
    visited: any = [];
    daysGraph: any;

    dataLoadFlag: boolean = false;

    daysGraphAppointment: any = [];
    datesofDaysGraph: any = [];
    countfordaysGraph: any = [];

    sortedCounts: any;
    AppointmentCount: any;

    visitedCount: any;
    highestVisistedDayDetails: any;

    mvistedPercenatge: any;
    campList: any;

    socialMediaSource: any = {};
    campignSourceNames: any;

    highestCampaignSource: any;
    mostSourcePercentage: any;

    highestCampaignName: any;

    MostvisiteddayCampaignName: any;

    most_visited_campaign: any;
    most_leads_created_source: any;
    most_visited_day: any;
    conductedCampaigns: any = [];
    campaignSearch: any;

    constructor(public datePipe: DatePipe, public auth_services: StaffPostAuthService, public router: Router) {}
    lineChart: any;
    columnChart: any;
    areaChart: any;

    campCols = [
        { field: 'name', title: 'Campaign Name', isUnique: true, hide: false },
        { field: 'leadCount', title: 'Leads', hide: false },
        { field: 'conCount', title: 'Visited', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    ngOnInit() {
        this.getCampaignDetails();

        // this.DateTrim();
        //    bar Graph

        // Sources for Campaign

        //Campaigns conducted
    }

    getCampaignDetails() {
        this.dataLoadFlag = true;
        this.campaignNameFetchForDropDown();
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            campaign: this.selectedCampaign,
            customerType: this.selectedCustomers,
        };
        this.auth_services.fetchCampaignDetails(data).subscribe((data: any) => {
            if (this.selectedCustomers == 1) {
                this.totalCustomersData = data.customer_data.filter(
                    (item: any) => (item.job_count_after_lead == 0 || item.job_count_after_lead == 1) && item.job_count_before_lead == 0
                );

                let temp = data.customer_data.filter((item: any) => item.job_count_after_lead != '0');

                let temp1 = data.customer_data.filter((item: any) => item.job_count_before_lead != '0');
            } else {
                this.totalCustomersData = data.customer_data;
            }
            this.appointment = this.totalCustomersData.filter((data: any) => {
                return data.purpose_id == 1;
            });

            this.visited = this.totalCustomersData.filter((data: any) => {
                return data.apptm_status == 5;
            });
            // let temp3 = data.customer_data.filter(
            //     (item: any) =>
            //         (item.smc_code === 'CMFB0125-0054' || item.smc_code === 'CMFB0125-0055' || item.smc_code === 'CMFB0125-0056') && item.apptm_status !== '5'
            // );

            // console.log('2025 Jan Campaign - Static Post>>>>>CMFB0125-0054>>>>>>>', temp3);
            // console.log('total customers data>>>>>>>', this.totalCustomersData);
            this.most_visited_campaign = this.getMostVisitedCampaign(this.totalCustomersData);
            if (this.most_visited_campaign) {
                const mostVisitedDayPercentage = Math.round((this.most_visited_campaign.visitedCount / this.most_visited_campaign.totalLeads) * 100);
                this.MostvisiteddayCampaignName = mostVisitedDayPercentage;
            } else {
                this.MostvisiteddayCampaignName = 0;
            }

            this.most_leads_created_source = this.getMostLeadsCreatedSource(this.totalCustomersData);
            if (this.most_leads_created_source) {
                let sourcePercentage = Math.round((this.most_leads_created_source?.visitedCount / this.most_leads_created_source?.totalLeads) * 100);
                this.mostSourcePercentage = sourcePercentage;
            } else {
                this.mostSourcePercentage = 0;
            }

            this.most_visited_day = this.getMostVisitedDayWithCampaign(this.totalCustomersData, this.campList);
            if (this.most_visited_day) {
                const totalCount = this.visited.length;
                let VisiteddayPercentage = Math.round((this.most_visited_day?.visitCount / totalCount) * 100);
                this.mvistedPercenatge = VisiteddayPercentage;
            } else {
                this.mvistedPercenatge = 0;
            }

            this.dataLoadFlag = false;
            this.DateTrim();
            this.socialMediaSourceFetch();
            this.CampaignNameDetailsStasticsSort();
        });
    }

    DateTrim() {
        this.dataLoadFlag = true;
        let dateToforGraph = new Date(this.dateTo);
        let dateFromforGraph = new Date(dateToforGraph);
        dateFromforGraph.setDate(dateToforGraph.getDate() - 7);

        // let data = {
        //     dateFrom: dateFromforGraph.toISOString().split('T')[0],
        //     dateTo: dateToforGraph.toISOString().split('T')[0],
        //     campaign: this.selectedCampaign,
        // };

        let currentDate = new Date(); // Current date
        let sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 6);

        let data = {
            dateFrom: sevenDaysAgo.toISOString().split('T')[0], // Format as YYYY-MM-DD
            dateTo: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            campaign: this.selectedCampaign,
            customerType: this.selectedCustomers,
        };

        this.auth_services.fetchCampaignDetails(data).subscribe((data: any) => {
            this.daysGraph = data.customer_data;

            //for Lead Count
            let graphData: { [key: string]: number } = {};

            this.daysGraph.forEach((data: any) => {
                const dateStr = data.lead_createdon.split(' ')[0];
                if (!graphData[dateStr]) {
                    graphData[dateStr] = 0;
                }
                graphData[dateStr]++;
            });
            let sortedDates = Object.keys(graphData).sort();

            // Retrieve counts for the sorted dates
            let sortedCounts = sortedDates.map((date) => ({
                date: date,
                count: graphData[date],
            }));

            let count = sortedCounts.map((data: any) => {
                return data.count;
            });
            let days = sortedCounts.map((data: any) => {
                return data.date;
            });
            this.countfordaysGraph = count;
            this.datesofDaysGraph = days;

            //for appointment count
            let appCount = this.daysGraph.filter((data: any) => {
                return data.purpose_id == 1;
            });

            const appGraphData: { [key: string]: number } = {};

            appCount.forEach((data: any) => {
                const dateStr = data.lead_createdon.split(' ')[0];
                if (!appGraphData[dateStr]) {
                    appGraphData[dateStr] = 0;
                }
                appGraphData[dateStr]++;
            });

            let appsortedDates = Object.keys(appGraphData).sort();

            let appsortedCounts = appsortedDates.map((date) => ({
                date: date,
                count: appGraphData[date],
            }));

            let appcount = appsortedCounts.map((data: any) => {
                return data.count;
            });

            this.AppointmentCount = appcount;

            //for visited
            let visitedCount = appCount.filter((data: any) => {
                return data.apptm_status == 5;
            });

            const visitedGraphData: any = {};

            visitedCount.forEach((data: any) => {
                const dateStr = data.lead_createdon.split(' ')[0];
                if (!visitedGraphData[dateStr]) {
                    visitedGraphData[dateStr] = {
                        count: 0,
                        campaign: data.smc_name,
                    };
                }
                visitedGraphData[dateStr].count++;
            });

            let visitedsortedDates = Object.keys(visitedGraphData).sort();

            let visitedsortedCounts = visitedsortedDates.map((date) => ({
                date: date,
                count: visitedGraphData[date].count,
                campaign: visitedGraphData[date].campaign,
            }));
            let highestCountItem;

            if (visitedsortedCounts.length > 0) {
                highestCountItem = visitedsortedCounts.reduce((prev, current) => (prev.count > current.count ? prev : current));
            }
            this.highestVisistedDayDetails = highestCountItem;

            let viscount = visitedsortedCounts.map((data: any) => {
                return data.count;
            });

            // const totalCount = visitedsortedCounts.reduce((total, item) => total + item.count, 0);
            // console.log('totalCount>???????VisitedtotalCount??????????????', totalCount);

            // let MostVisiteddayPercentage = Math.round((highestCountItem?.count / totalCount) * 100);
            // MostVisiteddayPercentage = MostVisiteddayPercentage;
            // console.log('hehe', MostVisiteddayPercentage);
            // this.mvistedPercenatge = MostVisiteddayPercentage;

            this.visitedCount = viscount;

            this.columnChart = {
                series: [
                    {
                        name: 'Leads',
                        data: this.countfordaysGraph,
                    },
                    {
                        name: 'Appointments',
                        data: this.AppointmentCount,
                    },
                    {
                        name: 'Visited',
                        data: this.visitedCount,
                    },
                ],
                chart: {
                    height: 500,
                    type: 'bar',
                    zoom: {
                        enabled: false,
                    },
                    toolbar: {
                        show: false,
                    },
                },
                colors: ['#805dca', '#e7515a', '#1b2e4b'],
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 3,
                    colors: ['transparent'],
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '100%',
                        endingShape: 'rounded',
                    },
                },
                grid: {
                    borderColor: '#e0e6ed',
                },
                xaxis: {
                    categories: this.datesofDaysGraph,
                    axisBorder: {
                        color: '#e0e6ed',
                    },
                },
                yaxis: {
                    opposite: false,
                    labels: {
                        offsetX: 0,
                    },
                },
                tooltip: {
                    theme: 'light',
                    y: {
                        formatter: function (val: any) {
                            return val;
                        },
                    },
                },
            };

            this.dataLoadFlag = false;
        });
    }

    campaignNameFetchForDropDown() {
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };
        this.auth_services.getSocialMediaCampaigns(data).subscribe((data: any) => {
            this.campList = data.campaigns;
        });
    }

    socialMediaSourceFetch() {
        this.auth_services.socialMediaCampaignsource().subscribe((data: any) => {
            data.sourceList.forEach((item: any) => {
                let sourceName = item.smcs_name;
                if (this.socialMediaSource[sourceName] == undefined) {
                    this.socialMediaSource[sourceName] = {
                        count: 0,
                        lead: 0,
                        appointment: 0,
                    };
                }
            });
            this.campignSourceNames = data.sourceList.map((item: any) => {
                return { id: item.smcs_id, name: item.smcs_name, LeadCount: 0, ConvertedCount: 0 };
            });

            this.totalCustomersData.map((data: any) => {
                this.campignSourceNames.map((item: any) => {
                    if (data.lead_social_media_source == item.id) {
                        item.LeadCount++;
                    }
                });
            });

            this.visited.map((data: any) => {
                this.campignSourceNames.map((item: any) => {
                    if (data.lead_social_media_source == item.id) {
                        item.ConvertedCount++;
                    }
                });
            });

            // let highestCountItem = this.campignSourceNames.reduce((prev: any, current: any) => (prev.LeadCount > current.LeadCount ? prev : current));
            // this.highestCampaignSource = highestCountItem;
            // // const totalCount = this.campignSourceNames.reduce((total: any, item: any) => total + item.LeadCount, 0);
            // const totalCount = this.highestCampaignSource?.LeadCount;

            // let MostVisiteddayPercentage = Math.round((highestCountItem?.ConvertedCount / totalCount) * 100);
            // this.mostSourcePercentage = MostVisiteddayPercentage;
            // console.log('Numbers found', highestCountItem);

            let leadCount = this.campignSourceNames.map((data: any) => {
                return data.LeadCount;
            });

            let convertedCount = this.campignSourceNames.map((data: any) => {
                return data.ConvertedCount;
            });

            let campaignNames = this.campignSourceNames.map((item: any) => {
                return item.name;
            });
            this.lineChart = {
                series: [
                    {
                        name: 'Leads',
                        data: leadCount,
                    },
                    {
                        name: 'Visited',
                        data: convertedCount,
                    },
                ],
                chart: {
                    height: 300,
                    type: 'line',
                    toolbar: false,
                },
                colors: ['#4361ee', '#141478'],
                tooltip: {
                    marker: false,
                    y: {
                        formatter(number: string) {
                            return number;
                        },
                    },
                    theme: 'light',
                },
                stroke: {
                    width: 2,
                    curve: 'smooth',
                },
                xaxis: {
                    categories: campaignNames,
                    axisBorder: {
                        color: '#e0e6ed',
                    },
                },
                yaxis: {
                    opposite: false,
                    labels: {
                        offsetX: 0,
                    },
                },
                grid: {
                    borderColor: '#e0e6ed',
                },
            };
        });
    }

    CampaignNameDetailsStasticsSort() {
        let campNameArray: any;

        if (this.campList && this.campList.length > 0) {
            campNameArray = this.campList.map((data: any) => {
                return { name: data.smc_name, id: data.smc_id, leadCount: 0, conCount: 0, numbers: [] };
            });
        } else {
            campNameArray = [{ name: '', id: '', leadCount: 0, conCount: 0, numbers: [] }];
        }

        this.totalCustomersData.map((data: any) => {
            campNameArray.map((item: any) => {
                if (data.smc_id == item.id) {
                    item.leadCount++;
                    item.numbers.push(data.phone);
                }
            });
        });

        this.visited.map((data: any) => {
            campNameArray.map((item: any) => {
                if (data.smc_id == item.id) {
                    item.conCount++;
                }
            });
        });

        this.conductedCampaigns = campNameArray;


        let highestCountItem = campNameArray.reduce((prev: any, current: any) => (prev.conCount > current.conCount ? prev : current));
        this.highestCampaignName = highestCountItem;

        // const totalCount = campNameArray.reduce((total: any, item: any) => total + item.conCount, 0);
        // const totalCount = this.highestCampaignName?.leadCount;
        // let MostVisiteddayPercentage = Math.round((highestCountItem?.conCount / totalCount) * 100);
        // this.MostvisiteddayCampaignName = MostVisiteddayPercentage;

        let leadCount = campNameArray.map((data: any) => {
            return data.leadCount;
        });

        let convertedCount = campNameArray.map((data: any) => {
            return data.conCount;
        });

        let campaignNames = campNameArray.map((item: any) => {
            return item.name;
        });

        this.areaChart = {
            series: [
                {
                    name: 'Leads',
                    data: leadCount,
                },
                {
                    name: 'Visited',
                    data: convertedCount,
                },
            ],
            chart: {
                type: 'area',
                height: 300,
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#805dca', '#4361ee'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            xaxis: {
                axisBorder: {
                    color: '#e0e6ed',
                },
            },
            yaxis: {
                opposite: false,
                labels: {
                    offsetX: 0,
                },
            },
            labels: campaignNames,
            legend: {
                horizontalAlign: 'left',
            },
            grid: {
                borderColor: '#e0e6ed',
            },
            tooltip: {
                theme: 'light',
            },
        };
    }

    getMostVisitedCampaign(customerData: any[]) {
        const visitedLeads = customerData.filter((lead) => lead.apptm_status === '5');
        const campaignMap: { [smc_id: string]: { visitedCount: number; totalLeads: number; smc_name: string } } = {};
        customerData.forEach((lead) => {
            const { smc_id, smc_name } = lead;
            if (!campaignMap[smc_id]) {
                campaignMap[smc_id] = { visitedCount: 0, totalLeads: 0, smc_name };
            }
            campaignMap[smc_id].totalLeads++;
            if (lead.apptm_status == '5') {
                campaignMap[smc_id].visitedCount++;
            }
        });
        let mostVisitedCampaign: any;
        Object.entries(campaignMap).forEach(([smc_id, stats]) => {
            if (!mostVisitedCampaign || stats.visitedCount > mostVisitedCampaign.visitedCount) {
                mostVisitedCampaign = {
                    smc_id,
                    smc_name: stats.smc_name,
                    visitedCount: stats.visitedCount,
                    totalLeads: stats.totalLeads,
                };
            }
        });

        return mostVisitedCampaign;
    }

    getMostLeadsCreatedSource(customerData: any[]) {
        const sourceNames: { [key: string]: string } = {
            '1': 'Facebook',
            '2': 'Instagram',
            '3': 'Whatsapp',
        };

        const sourceMap: { [source_id: string]: any } = {};
        customerData.forEach((lead) => {
            const { lead_social_media_source, apptm_status } = lead;
            if (!sourceMap[lead_social_media_source]) {
                sourceMap[lead_social_media_source] = {
                    source_id: lead_social_media_source,
                    sourceName: sourceNames[lead_social_media_source] || 'Unknown',
                    totalLeads: 0,
                    visitedCount: 0,
                };
            }
            sourceMap[lead_social_media_source].totalLeads++;
            if (apptm_status === '5') {
                sourceMap[lead_social_media_source].visitedCount++;
            }
        });

        let mostLeadsSource: any;
        Object.values(sourceMap).forEach((stats) => {
            if (!mostLeadsSource || stats.totalLeads > mostLeadsSource.totalLeads) {
                mostLeadsSource = {
                    source_id: stats.source_id,
                    sourceName: stats.sourceName,
                    totalLeads: stats.totalLeads,
                    visitedCount: stats.visitedCount,
                };
            }
        });

        return mostLeadsSource;
    }

    getMostVisitedDayWithCampaign(customerData: any[], campaignData: any[]) {
        const dateVisitMap: { [date: string]: { visitCount: number; smc_id: string } } = {};
        customerData.forEach((lead) => {
            const leadDate = lead.lead_createdon.split(' ')[0];
            if (lead.apptm_status === '5') {
                if (!dateVisitMap[leadDate]) {
                    dateVisitMap[leadDate] = { visitCount: 0, smc_id: lead.smc_id };
                }
                dateVisitMap[leadDate].visitCount++;
            }
        });
        let mostVisitedDay: any;
        let maxVisitCount = 0;
        for (const date in dateVisitMap) {
            if (dateVisitMap[date].visitCount > maxVisitCount) {
                maxVisitCount = dateVisitMap[date].visitCount;
                const smc_id = dateVisitMap[date].smc_id;
                // const campaign = campaignData.find((c) => c.smc_id === smc_id);
                // const smc_name = campaign ? campaign.smc_name : 'Unknown Campaign';
                mostVisitedDay = { date, visitCount: maxVisitCount };
            }
        }

        return mostVisitedDay;
    }

    redirectToWhatsappChat(numbers: any) {
        sessionStorage.setItem('chatNumbers', JSON.stringify(numbers));
        this.router.navigate(['whatsappchat']);

        // this.router.navigate(['whatsappchat'], {
        //     queryParams: { numbers: encodeURIComponent(JSON.stringify(numbers)) },
        // });

        // this.router.navigate(['whatsappchat'], {
        //     queryParams: {
        //         numbers: numbers,
        //     },
        // });
    }
}
