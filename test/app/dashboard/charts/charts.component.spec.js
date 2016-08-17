/* globals expect */
var path = '../../../../build/dashboard/charts/',
    Charts = require(path + 'charts.component.js').Charts;

describe('Charts', () => {
    var charts;

    beforeEach(() => {
        charts = new Charts();
    });

    it('has a chartName property', () => {
        expect(charts.chartName).to.be.a('string');
        expect(charts.chartName).to.equal('');
    });

    it('has a chartType property', () => {
        expect(charts.chartType).to.be.a('string');
        expect(charts.chartType).to.equal('pie');
    });

    it('has a series property', () => {
        expect(charts.series).to.be.a('string');
        expect(charts.series).to.equal('');
    });

    it('has a labels property', () => {
        expect(charts.labels).to.be.a('string');
        expect(charts.labels).to.equal('');
    });

    it('has a tableHead property', () => {
        expect(charts.tableHead).to.be.a('string');
        expect(charts.tableHead).to.equal('');
    });

    it('implements AfterViewInit', () => {
        charts.series = '1,2,3';
        charts.labels = 'a,b,c';

        charts.ngAfterViewInit();

        expect(charts.data).to.be.an('array');
        expect(charts.data[0]).to.equal(1);

        expect(charts.words).to.be.an('array');
        expect(charts.words[0]).to.equal('a');
    });
});

