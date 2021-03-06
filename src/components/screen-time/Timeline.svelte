<script lang='ts'>
    import { Spacer } from '@ollopa/cedar'
    import { clickOutside } from '@lib/utils'
    import Tooltip from '../Tooltip.svelte'
    import { timelines } from '@lib/data'
    import type { Timeline, TimelineCluster, Timestamp } from '@lib/types'
    
    export let episodeID: string
    export let colors: string[]    

    const expandAmount = .05
    let expandAt: number
    let element: HTMLElement
    let width: number

    let timeline: Timeline, expanded: TimelineCluster[]
    
    $: timeline = $timelines && $timelines.find(t => t.id === episodeID)
    $: expanded = timeline && expandAt && filtered()

    const as_timestamp = (playhead: number): string => {
        const FPS = 29.97
        let sec: string | number = (timeline?.frames * playhead) / FPS
        const hour = Math.floor(sec / 60 / 60)
        const min = `${Math.floor(sec / 60) % 60}`.padStart(2, '0')
        sec = `${Math.floor(sec) % 60}`.padStart(2, '0')
        return `${hour}:${min}:${sec}`
    }

    const withinExpandedRegion = ({ start, end }: Timestamp) => 
        start >= expandAt - (expandAmount * 2) && end <= expandAt + (expandAmount * 2)
                    
    const filtered = (): TimelineCluster[] => 
        timeline.clusters
            .map(c => ({ ...c, timestamps: c.timestamps .filter(withinExpandedRegion) }))
            .filter(c => c.timestamps.length > 0)

    const lineStyle = (i, { start, end }: Timestamp, _) => {
        return `
            background: ${colors[i]};
            width: ${(end - start) * width}px;
            left: ${start * width}px;
        `
    }
    
    const expandedLineStyle = (i, { start, end }: Timestamp, _) => {
        return `
            background: ${colors[i]};
            width: ${(end - start) * width * (1 / expandAmount)}px;
            left: ${(start - expandAt) * width * (1 / expandAmount) + (width / 2)}px;
        `
    }

    const hideExpanded = () => { expandAt = null }

    const setExpanded = ({ offsetX }) => { expandAt = offsetX / width }
</script>

{#if expanded}
    <Tooltip 
        x={width / 2 + element.getBoundingClientRect().left} 
        y={element.getBoundingClientRect().top}
    >        
        <div class='expanded-container' style={`width: ${width}px`}>
            <div class="timestamp-lines">
                <div></div><div></div><div></div>
            </div>
            <div class="timestamps">
                <p>{as_timestamp(expandAt - (expandAmount / 2))}</p>
                <p>{as_timestamp(expandAt)}</p>
                <p>{as_timestamp(expandAt + (expandAmount / 2))}</p>
            </div>
            {#each expanded as { id, timestamps }}
                <Spacer />
                <div class='row'>
                    {#each timestamps as timestamp}
                        <div 
                            class='expanded-line' 
                            style={expandedLineStyle(id, timestamp, width)}
                        ></div>
                    {/each}
                </div>
                <Spacer />
            {/each}
        </div>
    </Tooltip>
{/if}

<div class='container' bind:this={element} bind:clientWidth={width}>
    {#if timeline}
        <div class="chart">
            {#each timeline.clusters as { id, timestamps }}    
                <Spacer />
                <div class='row'>
                    {#each timestamps as timestamp}
                        <div 
                            class='line' 
                            class:highlighted={expanded ? withinExpandedRegion(timestamp) : true}
                            style={lineStyle(id, timestamp, width)}
                        ></div>
                    {/each}
                </div>        
            {/each}
        </div>
        <!-- Psuedo element to capture all interaction -->
        <div 
            class="interaction-capturer" 
            on:mousemove={setExpanded}
            on:dragover={setExpanded}
            on:click={setExpanded}
            on:mouseleave={hideExpanded}
            on:dragend={hideExpanded}
            use:clickOutside={hideExpanded}
        ></div>
    {/if}
</div>


<style>
    .expanded-container {
        position: relative;
        overflow-x: hidden;
    }
    .expanded-container .timestamps {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-family: monospace;
    }
    .expanded-container .timestamp-lines {
        position: absolute;
        top: 25%;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
    }
    .expanded-container .timestamp-lines div {
        width: 1px;
        height: 100%;
        border-left: 2px dashed var(--gray);
        border-right: 2px dashed var(--gray);
    }

    .container {
        position: relative;
    }
    
    .interaction-capturer {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        transition: border 250ms ease-in;
    }

    .row {
        position: relative;
        height: 8px;
    }

    .expanded-line {
        position: absolute;
        height: 8px;
        border-radius: 4px;
    }

    .line {
        position: absolute;
        border-radius: 1px;
        height: 100%;
    }
    .line:not(.highlighted) {
        background: var(--gray) !important;
    }
</style>