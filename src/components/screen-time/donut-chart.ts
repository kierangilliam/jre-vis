import { COLORS } from '@lib/constants';
import * as d3 from 'd3';

//https://bl.ocks.org/guilhermesimoes/49ba71346a956ed0a12e9bc515be5804
export function makeDonutChart({ animationDuration = 750, innerRadius = 0, outerRadius = 100 }) {
    const arc = d3.arc()
    const pie = d3.pie()
        .sort(null)
        .value(d => d.value)
    let data = []

    function updateTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return (t) => arc(i(t))
    }

    function exitTween(d) {
        var end = Object.assign({}, this._current, { startAngle: this._current.endAngle });
        var i = d3.interpolate(d, end);
        return function (t) {
            return arc(i(t));
        };
    }

    function joinKey(d) {
        return d.data.series;
    }

    function pieChart(context) {
        const slices = context
            .selectAll('.slice')
            .data(pie(data), joinKey)

        const oldSlices = slices.exit()

        const newSlices = slices.enter().append('path')
            .each(function (d) { this._current = Object.assign({}, d, { startAngle: d.endAngle }); })
            .attr('class', 'slice')
            .style('fill', (d) => d.data.color)
            .style('stroke', COLORS.white)
            .style('stroke-width', 3)

        const t = d3.transition().duration(animationDuration)

        arc
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)

        oldSlices
            .transition(t)
            .attrTween('d', exitTween)
            .remove()

        const t2 = t.transition()
        slices
            .transition(t2)
            .attrTween('d', updateTween)

        const t3 = t2.transition()
        newSlices
            .transition(t3)
            .attrTween('d', updateTween)
    }

    pieChart.data = function (_) {
        return arguments.length ? (data = _, pieChart) : data;
    }

    pieChart.getImages = (context): { image: string, x: number, y: number, id: string }[] => {
        const images = []

        context
            .selectAll('.slice')
            .data(pie(data), joinKey)
            .each(d => {
                const [x, y] = arc.centroid(d)
                images.push({ image: d.data.image, x, y, id: d.data.series })
            })

        return images
    }

    return pieChart
}