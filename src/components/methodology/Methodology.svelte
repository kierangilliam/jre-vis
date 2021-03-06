<script lang='ts'>
	import ReverseStem from '../ReverseStem.svelte'
	import A from './Link.svelte'
</script>

<h1>Methodology</h1>

<p>
	Here I discuss the methods I used for data collection, data wrangling, and visualization.
	Along the way I also share some limitations from these methods.	
</p>

<h3>Data Collection</h3>

<p>
	<A href='jre-data-wrangling'>Github</A>
</p>

<p>
	This step was pretty straightforward: use the YouTube API to collect episode details,
	captions, and statistics.
	I used youtube-dl to download all of the videos publicly available on the JRE channel at 360p, ~30fps. 
	This totaled to be almost 700gb of data. I got rate limited. A lot. 
</p>

<h5>Limitations</h5>

<p>
	YouTube captions are pretty good but definitely are nowhere near human-level transcription.
	I played around with some open source speech-to-text libraries like 
	<A href='deepspeech2'>deepspeech</A>, but didn't have the compute power, at the end of the day, 
	to process all 1500+ episodes. I am therefore at the mercy of father Google.
</p>

<h3>Data Wrangling</h3>

<p>
	All of these methods have a shared commonality: unsupervised and computationally cheap
	enough to run on my laptop.
	1500+ episodes is far too many to manually sift through and label. 
	I needed methods that may not be 100% accurate, but were good enough at generalizing.
</p>

<h4>Screen Time</h4>

<p>
	In this section, I wanted to ask was, 'is the conversation dominated by one person, 
	or does it have equal representation from all parties?' 
	The process of speaker segmentation from audio is called diarization.
	This led me to trying several diarization techniques. 
	I tried approaches from my own (terrible) home-brewed spectrogram CNN to libraries such as 
	<A href='pyannote'>pyannote</A>.
	However, nothing I tried was 1. quick enough for 3600+ hours of audio or 2. anywhere near accurate. 
</p>

<p>
	When I was building the spectrogram CNN, I realized that I would need some sort of 
	way to validate it was working without having to listen to the classified audio.
	So, as a proxy to diarization, I built a pretty naive solution. The first step was to 
	take the average across frames to produce a list of scalars.
</p>

<p>
	When visualized over time, this is what they look like. 
</p>

<div class='image'><img src='./methodology/frame-averages.png' alt=''></div>

<p>
	As you can see, clusters form nicely out these averages. 
	The next step was to use a 1D clustering algorithm. I chose KDE.
	This ended up proxying diarization pretty well, so I dropped my attempts at a DL 
	solution in place for this naive method.
</p>

<h5>Limitations</h5>

<p>
	For a good majority of the episodes, this method works pretty well. 
	It fails terribly when there is a lot of movement in the podcast.
</p>

<div class='image'><img src='./methodology/clusters-bad.png' alt=''></div>

<p>
	If I were to spend more time on this project, I would create some way to automatically prune episodes with 
	a large frame-average spread. 
	If you notice a chart in the screentime section that inaccurately represents that episode,
	please <A href='kierangilliam/jre-vis'>submit an issue</A>.
</p>

<h4>Topics</h4>

<p>
	The inspiration for Topics Over Time came from <A href="10.1145">this</A>
	paper by one of my professors. 
	In this paper, the authors talk about tags and the "Blogosphere."
	They state that user generated tags can perform well at determining the broad group of a blog, 
	but perform less well at describing the contents of an individual article. 
	I believe the same can be said for podcasts.
</p>

<p>
	YouTube videos often carry “tags”. For example, on a video with the guest Tristan Harris, 
	the episode is tagged as, 
	<i>
		Joe Rogan Experience, JRE, Joe, Rogan, MMA, stand, up, 
		funny, Freak, Party, Joe Rogan, Tristan Harris. 
	</i>
	It isn’t until the 14th tag when we see the guest’s name appear. 
	This episode is about Tristan Harris describing the negative consequences that social media platforms have on society. 
	The last seven tags on this video are 
	<i>
		Facebook, Twitter, Instagram, Google, Apple, Android, iPhone.
	</i> 
	They <i>hint</i> at the episode contents... but still do a rather poor job. 
	Episode descriptions offer a little more insight into the topics discussed, 
	but, because many JRE episodes tend to be a few hours long, 
	descriptions are insufficient at capturing everything discussed.
</p>

<p>
	I mimic the approach by Brooks and Montanez
	by using TF-IDF to drive automated topic extraction from the caption data.
</p>

<p>
	Loosely, TF-IDF is a cheap algorithm that gives each word in a document (an episode, in this case)
	an <i>importance</i> score. Words that appear commonly in all documents are given a low score.
	Words that appear many times in a handful of documents, but seldom in the majority, are given
	high scores for the former documents and low scores for the latter documents.
	Google uses this technique when ranking what webpages it shows you.
</p>

<p>
	It is often the case you will need to <i>stem</i> words to get the most effectiveness out of TF-IDF.
	Stemming is basically process shortening a word to its most generic version;
	'answer, answering, answered' would all have the same stem, 'answer', for example.
</p>

<h5>Limitations</h5>

<p>
	The <strong>topics over time</strong> chart will not show every single occurrence of a given word.
	This is mainly due to the fact I couldn't get captions for every single video and the captions
	aren't always accurate.
</p>

<h4>Episode Similarity</h4>

<p>
	Similarity could be ranked in many ways... 
	How many likes did an episode get?
	How often does Joe shout? 
	What is the aggregate sentiment in the comments section?
	I opted to rank similarity based on how similar topics were across episodes.
</p>

<p>
	This method relied heavily on the TF-IDF scores addressed above.
	We can treat the TF-IDF scores as vectors and use the cosine angle between two vectors 
	to score their similarity. 
	If that made sense, great, if not, <A href='tf-idf'>this article</A>
	does a good job at explaining this concept.	
</p>

<p>
	As you have have noticed, this method works very well for determining similarity.
	Musicians are often grouped with other musicians, comics with comics, and scientists with scientists.
</p>

<h3>Data Visualization</h3>

<h4>Topics Over Time</h4>

<p>
	This was heavily inspired by <A href='bitstream'>this</A> paper's visualization:
</p>

<div class='image'>
	<img 
		width=350
		src='./methodology/visual-temporal-tweet.png' 
		alt={`screenshot from aforementioned paper's visualization`}
	>
</div>

<p>
	Stemming is communicated using this constantly updating element 
	<span class='number-chip'><ReverseStem stem='extinct' /></span>
</p>

<p>
	This is how I show the user that extinct, extinction, and extinctions all mean the same thing in this context.
</p>

<h4>Performance</h4>

<p>
	Performance was my main enemy during this project. 
	The main performance killers came from loading the large data files 
	(the episode similarity data file has over a million rows),
	and javascript evaluation and execution (parsing data or animating). 	
</p>

<p>
	I could have chopped up big data files and lazily requested data as users
	clicked on different episodes or topics, but that would just defer the lag to a later stage.	
	I'd rather have the client chug a few dozen megabytes and then have a smooth experience after that,
	than to have many constant pauses as data is fetched lazily.
</p>

<p>
	I used protobufs, instead, to minimize the footprint of the data.
	The previously mentioned million-row file as a csv is about ~60mb. 
	When converted to protobufs, it takes up around ~15mb.
</p>

<p>
	Though, because I have gone for the data-chug route, the <i>time to first interaction</i> suffers.
	I alleviate this using three methods: 
	1. intersection observers, 2. web workers, and (paradoxically) 3. another chart.
</p>

<h5>Intersection Observers</h5>

<p>
	The <A href='Intersection_Observer'>Intersection Observer API</A>
	allows you to subscribe to an element's visibility status. 
	The use case here was obvious and simple: don't render animating content when the 
	user cannot see that section of the page.
</p>

<h5>Web Workers</h5>

<p>
	<A href='Web_Workers'>Web Workers</A>
	allow you to execute javascript off of the main thread. 
	This is handy when you have some computationally heavy work that you 
	need to do client-side but don't want to block the main thread that renders content.
	I used webworkers to download and parse my data. 
	For the protobuf data, I use <A href="Transferable">transferables</A> so that data isn't copied from
	the worker thread to the main thread. Instead, the ownership is transferred from one process to the next.
</p>

<h5>Like Ratio / Views Line Chart</h5>

<p>
	I added this chart last minute because I needed something relatively eye-grabbing 
	that would make a user pause for a second before scrolling. 
	This chart uses a (proportionally) small 300kb 'episodes' csv file that every visualization depends on.
	As the user parses the somewhat opaque visualization, I load and parse all of the data 
	in the background that is used for the other visualizations.
</p>

<h5>Svelte</h5>

<p>
	Finally, I need to mention Svelte. 
	Svelte is a faster and lightweight alternative to frameworks like React, Angular, or Vue. 
	Furthermore, it is very straightforward to use, making the design iteration phase fairly quick.
</p>


<style>
	.image {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	img {
		width: 35rem;
	}

	p {
		margin: var(--s-3) 0;
	}

	h3 {
		margin-top: var(--s-12);
	}

	h4 {
		text-decoration: underline;
	}
	
	h4, h5 {
		margin-top: var(--s-6);
	}
</style>