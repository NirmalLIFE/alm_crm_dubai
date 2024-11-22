import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-social-media-campaign-report',
    templateUrl: './social-media-campaign-report.component.html',
    styleUrls: ['./social-media-campaign-report.component.css'],
})
export class SocialMediaCampaignReportComponent implements OnInit {
    public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public selectedCampaign: any;
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

    constructor(public datePipe: DatePipe, public auth_services: StaffPostAuthService) {}
    lineChart: any;
    columnChart: any;
    areaChart: any;

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
        };
        this.auth_services.fetchCampaignDetails(data).subscribe((data: any) => {
            this.totalCustomersData = data.customer_data;

            this.appointment = this.totalCustomersData.filter((data: any) => {
                return data.purpose_id == 1;
            });

            this.visited = this.appointment.filter((data: any) => {
                return data.apptm_status == 5;
            });
            this.dataLoadFlag = false;
            console.log('appointment', this.appointment);
            console.log('visited', this.visited);
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

        let data = {
            dateFrom: dateFromforGraph.toISOString().split('T')[0],
            dateTo: dateToforGraph.toISOString().split('T')[0],
            campaign: this.selectedCampaign,
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
            console.log('Graph data', graphData);
            let sortedDates = Object.keys(graphData).sort();

            // Retrieve counts for the sorted dates
            let sortedCounts = sortedDates.map((date) => ({
                date: date,
                count: graphData[date],
            }));
            console.log('Sorted Count', sortedCounts);

            let count = sortedCounts.map((data: any) => {
                return data.count;
            });
            let days = sortedCounts.map((data: any) => {
                return data.date;
            });
            this.countfordaysGraph = count;
            this.datesofDaysGraph = days;
            console.log('Sorted Dates and Counts countfordaysGraph', this.countfordaysGraph);
            console.log('Sorted Dates and Counts countfordaysGraph', this.datesofDaysGraph);

            //for appointment count
            let appCount = this.daysGraph.filter((data: any) => {
                return data.purpose_id == 1;
            });

            console.log('appCount', appCount);

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

            console.log('Visited GraphData', visitedGraphData);

            let visitedsortedDates = Object.keys(visitedGraphData).sort();

            let visitedsortedCounts = visitedsortedDates.map((date) => ({
                date: date,
                count: visitedGraphData[date].count,
                campaign: visitedGraphData[date].campaign,
            }));

            console.log('visitedsortedCounts', visitedsortedCounts);

            let highestCountItem;

            if (visitedsortedCounts.length > 0) {
                highestCountItem = visitedsortedCounts.reduce((prev, current) => (prev.count > current.count ? prev : current));
            }
            console.log(highestCountItem);
            this.highestVisistedDayDetails = highestCountItem;
            let viscount = visitedsortedCounts.map((data: any) => {
                return data.count;
            });

            const totalCount = visitedsortedCounts.reduce((total, item) => total + item.count, 0);

            let MostVisiteddayPercentage = Math.round((highestCountItem?.count / totalCount) * 100);
            MostVisiteddayPercentage = MostVisiteddayPercentage;
            console.log('hehe', MostVisiteddayPercentage);
            this.mvistedPercenatge = MostVisiteddayPercentage;

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
                        name: 'Converted',
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

            let highestCountItem = this.campignSourceNames.reduce((prev: any, current: any) => (prev.LeadCount > current.LeadCount ? prev : current));
            this.highestCampaignSource = highestCountItem;

            const totalCount = this.campignSourceNames.reduce((total: any, item: any) => total + item.LeadCount, 0);

            let MostVisiteddayPercentage = Math.round((highestCountItem?.LeadCount / totalCount) * 100);
            this.mostSourcePercentage = MostVisiteddayPercentage;
            console.log('Numbers found', highestCountItem);

            let leadCount = this.campignSourceNames.map((data: any) => {
                return data.LeadCount;
            });

            let convertedCount = this.campignSourceNames.map((data: any) => {
                return data.ConvertedCount;
            });

            let campaignNames = this.campignSourceNames.map((item: any) => {
                return item.name;
            });
            console.log('socialMediaSource', this.socialMediaSource);
            this.lineChart = {
                series: [
                    {
                        name: 'Leads',
                        data: leadCount,
                    },
                    {
                        name: 'Converted',
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
                return { name: data.smc_name, id: data.smc_id, leadCount: 0, conCount: 0 };
            });
        } else {
            campNameArray = [{ name: '', id: '', leadCount: 0, conCount: 0 }];
        }

        this.totalCustomersData.map((data: any) => {
            campNameArray.map((item: any) => {
                if (data.smc_id == item.id) {
                    item.leadCount++;
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

        console.log('campNameArray', campNameArray);

        let highestCountItem = campNameArray.reduce((prev: any, current: any) => (prev.conCount > current.conCount ? prev : current));
        this.highestCampaignName = highestCountItem;
        console.log('highestCampaignName', this.highestCampaignName);

        const totalCount = campNameArray.reduce((total: any, item: any) => total + item.conCount, 0);

        let MostVisiteddayPercentage = Math.round((highestCountItem?.conCount / totalCount) * 100);
        this.MostvisiteddayCampaignName = MostVisiteddayPercentage;

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
                    name: 'Converted',
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
}
