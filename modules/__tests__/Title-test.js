import expect from 'expect'
import React from 'react'
import { render } from 'react-dom'
import { renderToString } from 'react-dom/server'
import Title, { flushTitle } from '../Title'
import { findRenderedComponentWithType } from 'react-addons-test-utils'

describe('Title', () => {

  beforeEach(() => {
    flushTitle()
    document.title = ''
  })

  const A = React.createClass({
    render() {
      return (
        <div>
          <Title render="A"/>
          <B/>
        </div>
      )
    }
  })

  const B = React.createClass({
    getInitialState() {
      return { title: 'B' }
    },

    render() {
      return (
        <div>
          <Title render={prev => `${prev} | ${this.state.title}`}/>
          <C/>
        </div>
      )
    }
  })

  const C = React.createClass({
    render() {
      return (
        <div>
          <Title render={prev => `${prev} | C`}/>
        </div>
      )
    }
  })

  it('renders the title', (done) => {
    const div = document.createElement(div)
    render(<A/>, div, () => {
      expect(document.title).toEqual('A | B | C')
      done()
    })
  })

  it('handles state changes in the middle of a chain', (done) => {
    // incidentally tests the previous and next instances
    // not getting screwed up too.
    const div = document.createElement(div)
    render(<A/>, div, function () {
      expect(document.title).toEqual('A | B | C')
      const b = findRenderedComponentWithType(this, B)
      b.setState({
        title: 'B Updated'
      }, () => {
        expect(document.title).toEqual('A | B Updated | C')
        done()
      })
    })
  })

  describe('server rendering with flushTitle', () => {
    it('returns the title', () => {
      renderToString(<A/>)
      const title = flushTitle()
      expect(title).toEqual('A | B | C')
    })

    it('can handle multiple renders (simulating multiple requests)', () => {
      renderToString(<A/>)
      const title = flushTitle()
      expect(title).toEqual('A | B | C')
      // next request comes in
      const NEW_TITLE = 'sorry, I used a singleton'
      renderToString(<Title render={NEW_TITLE}/>)
      const newTitle = flushTitle()
      expect(newTitle).toEqual(NEW_TITLE)
    })
  })

})
