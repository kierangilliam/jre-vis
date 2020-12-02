importScripts('https://unpkg.com/pbf@3.0.5/dist/pbf.js')

async function getBuffer(endpoint) {
    const response = await fetch(endpoint)
    const data = await response.arrayBuffer();
    return data;
}

async function getEpisodeSimilarityData() {
    function loadSims(buffer) {
        const pbf = new Pbf(new Uint8Array(buffer))
        const { rows } = EpisodeSims.read(pbf)
        return rows
    }

    function loadIDLookup(buffer) {
        const pbf = new Pbf(new Uint8Array(buffer))
        const { rows } = IDs.read(pbf)
        return rows
    }

    const [epSimBuffer, idLookupBuffer] = await Promise.all(
        [getBuffer('./ep_sim'), getBuffer('./ep_sim_id_lookup')]
    )

    const episodeSimilarityTable = loadSims(epSimBuffer)
    const idLookupTable = loadIDLookup(idLookupBuffer)

    return [episodeSimilarityTable, idLookupTable]
}

async function getTimelineData() {
    const buffer = await getBuffer('./screen_time_timelines')
    const pbf = new Pbf(new Uint8Array(buffer))
    const { timelines } = Timelines.read(pbf)

    return timelines
}

self.onmessage = async (message) => {
    const enc = new TextEncoder(); // always utf-8

    if (message.data === 'Timelines') {
        console.time('Load Timelines Data (Worker)')
        const timelines = await getTimelineData()
        const ab = enc.encode(JSON.stringify({ timelines }))
        self.postMessage(ab, [ab.buffer])
        console.timeEnd('Load Timelines Data (Worker)')
        return
    }

    else if (message.data === 'EpisodeSimilarity') {
        console.time('Load Episode Similarity Data (Worker)')
        const [episodeSimilarityTable, idLookupTable] = await getEpisodeSimilarityData()

        console.time('Episode Similarity: Object Array Buffer (worker)')
        const ab = enc.encode(JSON.stringify({ episodeSimilarityTable, idLookupTable }))
        console.timeEnd('Episode Similarity: Object Array Buffer (worker)')

        self.postMessage(ab, [ab.buffer])
        console.timeEnd('Load Episode Similarity Data (Worker)')
        return
    }

    console.error('Datatype requested unknown:', message.data)
}


////////////////////////////////////////////////////////////////
////////
//////// Copy and paste output from `pbf --browser *.proto`
////////
////////////////////////////////////////////////////////////////

'use strict'; // code generated by pbf v3.2.1

// EpisodeSims ========================================

var EpisodeSims = self.EpisodeSims = {};

EpisodeSims.read = function (pbf, end) {
    return pbf.readFields(EpisodeSims._readField, { rows: [] }, end);
};
EpisodeSims._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.rows.push(EpisodeSim.read(pbf, pbf.readVarint() + pbf.pos));
};
EpisodeSims.write = function (obj, pbf) {
    if (obj.rows) for (var i = 0; i < obj.rows.length; i++) pbf.writeMessage(1, EpisodeSim.write, obj.rows[i]);
};

// IDs ========================================

var IDs = self.IDs = {};

IDs.read = function (pbf, end) {
    return pbf.readFields(IDs._readField, { rows: [] }, end);
};
IDs._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.rows.push(ID.read(pbf, pbf.readVarint() + pbf.pos));
};
IDs.write = function (obj, pbf) {
    if (obj.rows) for (var i = 0; i < obj.rows.length; i++) pbf.writeMessage(1, ID.write, obj.rows[i]);
};

// ID ========================================

var ID = self.ID = {};

ID.read = function (pbf, end) {
    return pbf.readFields(ID._readField, { id: "", idNum: 0 }, end);
};
ID._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.idNum = pbf.readVarint();
};
ID.write = function (obj, pbf) {
    if (obj.id) pbf.writeStringField(1, obj.id);
    if (obj.idNum) pbf.writeVarintField(2, obj.idNum);
};

// EpisodeSim ========================================

var EpisodeSim = self.EpisodeSim = {};

EpisodeSim.read = function (pbf, end) {
    return pbf.readFields(EpisodeSim._readField, { idNum1: 0, idNum2: 0, similarity: 0 }, end);
};
EpisodeSim._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.idNum1 = pbf.readVarint();
    else if (tag === 2) obj.idNum2 = pbf.readVarint();
    else if (tag === 3) obj.similarity = pbf.readFloat();
};
EpisodeSim.write = function (obj, pbf) {
    if (obj.idNum1) pbf.writeVarintField(1, obj.idNum1);
    if (obj.idNum2) pbf.writeVarintField(2, obj.idNum2);
    if (obj.similarity) pbf.writeFloatField(3, obj.similarity);
};

// code generated by pbf v3.2.1

// Timelines ========================================

var Timelines = self.Timelines = {};

Timelines.read = function (pbf, end) {
    return pbf.readFields(Timelines._readField, { timelines: [] }, end);
};
Timelines._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.timelines.push(Timeline.read(pbf, pbf.readVarint() + pbf.pos));
};
Timelines.write = function (obj, pbf) {
    if (obj.timelines) for (var i = 0; i < obj.timelines.length; i++) pbf.writeMessage(1, Timeline.write, obj.timelines[i]);
};

// Timeline ========================================

var Timeline = self.Timeline = {};

Timeline.read = function (pbf, end) {
    return pbf.readFields(Timeline._readField, { id: "", clusters: [], frames: 0 }, end);
};
Timeline._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.clusters.push(Cluster.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) obj.frames = pbf.readVarint();
};
Timeline.write = function (obj, pbf) {
    if (obj.id) pbf.writeStringField(1, obj.id);
    if (obj.clusters) for (var i = 0; i < obj.clusters.length; i++) pbf.writeMessage(2, Cluster.write, obj.clusters[i]);
    if (obj.frames) pbf.writeVarintField(3, obj.frames);
};

// Cluster ========================================

var Cluster = self.Cluster = {};

Cluster.read = function (pbf, end) {
    return pbf.readFields(Cluster._readField, { id: 0, timestamps: [] }, end);
};
Cluster._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
    else if (tag === 2) obj.timestamps.push(Timestamp.read(pbf, pbf.readVarint() + pbf.pos));
};
Cluster.write = function (obj, pbf) {
    if (obj.id) pbf.writeVarintField(1, obj.id);
    if (obj.timestamps) for (var i = 0; i < obj.timestamps.length; i++) pbf.writeMessage(2, Timestamp.write, obj.timestamps[i]);
};

// Timestamp ========================================

var Timestamp = self.Timestamp = {};

Timestamp.read = function (pbf, end) {
    return pbf.readFields(Timestamp._readField, { start: 0, end: 0 }, end);
};
Timestamp._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.start = pbf.readFloat();
    else if (tag === 2) obj.end = pbf.readFloat();
};
Timestamp.write = function (obj, pbf) {
    if (obj.start) pbf.writeFloatField(1, obj.start);
    if (obj.end) pbf.writeFloatField(2, obj.end);
};
