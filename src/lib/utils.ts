import * as d3 from 'd3'

export interface Episode {
    guests: string
    published: Date
    title: string
    number: number
    id: string
    main: boolean
}

export const wait = async (ms: number) =>
    new Promise(res => setTimeout(() => res(), ms))

export const setCSSVar = ([name, value]: [string, string]) =>
    document.documentElement.style.setProperty(`--${name}`, value)

export const getCSSVar = (name: string) =>
    getComputedStyle(document.body).getPropertyValue(`--${name}`)

export const getCSSVarPx = (name: string) =>
    parseInt(getCSSVar(name).split('px')[0])

export const chunk = (arr, chunkSize) => {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
}

export let episodes: Episode[] = [];
(async () => {
    episodes = (await d3.csv('./episodes.csv'))
        .map(({ published, number, main, ...rest }) => ({
            published: new Date(published),
            number: +number,
            main: main === "True" ? true : false,
            ...rest,
        }))
})();

export const episode = (id: string) => {
    return episodes.find(e => e.id === id)
}

export const getTitle = (id: string) => {
    let { title, guests } = episode(id)

    if (guests.toLowerCase().includes("part")) {
        guests = guests.replace(/\(Part?.*\)/g, "")
    }

    return guests ? guests : title
}