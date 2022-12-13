type Illustration = 'rabbit' | 'happy' | 'bok' | '2023'
type Shape = 'circle' | 'square' | 'heart' | 'triangle'
type Color = 'pink' | 'yellow' | 'red' | 'green'

interface CardDesign {
	shape: Shape
	color: Color
	illustration: Illustration
}

interface Card {
	sender: string
	reciever: string
	card: CardDesign
	text: string
	musicId: number
}

interface CardExt extends Card {
	_id: any
	created_at: string
}

interface Music {
	id: number
	title: string
	artist: string
	lyrics: string
	fullLyrics: string
	image: string
	spotifyLink: string
	youtubeLink: string
}

type CardReq = Omit<Card, 'id', 'created_at'>

export { Illustration, Shape, Color, CardDesign, Card, CardExt, Music }
