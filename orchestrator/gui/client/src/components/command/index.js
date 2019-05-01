import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'
import qs from 'query-string'

import { Button, Input } from 'reactstrap'
import classnames from 'classnames'

import * as CommandActions from '../../actions/command'

import {
    CommandTable,
    CommandInfo,
    GenerateCommands
} from './pages'

const str_fmt = require('string-format')

class Commands extends Component {
    constructor(props, context) {
        super(props, context)
        this.commandInfo = this.commandInfo.bind(this)

        this.validPages = [
            '',
            'info',
            'generate'
        ]

        this.commandUpdate = null
        this.updateIntervals = [
            5, 10, 15, 20, 25, 30
        ]

        this.state = {
            updateInterval: 10 // seconds
        }
    }

    componentDidMount() {
        // this.commandUpdate = setInterval(this.props.getCommands, this.state.updateInterval * 1000)
    }

    componentWillUnmount() {
        clearInterval(this.commandUpdate)
    }

    commandInfo(cmd) {
        this.props.history.push({
            pathname: str_fmt('/command/info/{cmd}', {cmd: cmd})
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props !== nextProps
        let state_update = this.state !== nextState

        if (state_update) {
            console.log('Update interval change')
            clearInterval(this.commandUpdate)
            this.commandUpdate = setInterval(this.props.getCommands, nextState.updateInterval * 1000)
        }

        return props_update || state_update
    }

    getContent(page, command) {
        switch (page) {
            case 'generate':
                return (
                    <div className="col-12">
                        <h1>Command Generator</h1>
                        <GenerateCommands />
                    </div>
                )
            case 'info':
                return (
                    <div className="col-12">
                        <h1>Command { command } Info</h1>
                        <CommandInfo command_id={ command } />
                    </div>
                )
            default:
                return (
                    <div className="col-12">
                        <h1>Commands</h1>
                        <CommandTable cmdInfo={ this.commandInfo } />
                    </div>
                )
        }
    }

    updateIntervalOptions() {
        let options = this.updateIntervals.map((interval, i) => {
            return (
                <li key={ i }>
                    <a
                        href='#'
                        className={ 'dropdown-item' + (interval === this.state.updateInterval ? ' active' : '') }
                        onClick={ () => this.setState({ updateInterval: interval }) }
                    >
                        { interval === this.state.updateInterval ? '* ' : '' }{ interval }
                    </a>
                </li>
            )
        })

        return (
            <div
                className='dropdown dropdown-menu-right'
                style={{
                    position: 'fixed',
                    bottom: '5px',
                    left: '5px'
                }}
            >
                <Button
                    color='default'
                    size='sm'
                    className='dropdown-toggle'
                    data-toggle='dropdown'
                    aria-haspopup='true'
                    aria-expanded='true'
                >
                    Update Intervals
                </Button>

                <ul className='dropdown-menu'>
                    { options }
                </ul>
            </div>
        )
    }

    render() {
        let {page, command} = this.props.match.params
        page = this.validPages.indexOf(page) ===  -1 ? '' : page

        let meta = {
            title: str_fmt('{base} | Command {page}', {base: this.props.siteTitle, page: page}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

        return (
            <DocumentMeta { ...meta } extend >
                <div className="row mx-auto">
                    { this.getContent(page, command) }
                    { this.updateIntervalOptions() }
                </div>
            </DocumentMeta>
        )
    }
}

function mapStateToProps(state) {
    return {
        siteTitle: state.Util.site_title,
        orchestrator: {
            name: state.Util.name || 'N/A'
        },
        admin: state.Auth.access.admin
    }
}


function mapDispatchToProps(dispatch) {
    return {
        getCommands: (page, sizePerPage, sort) => dispatch(CommandActions.getCommands(page, sizePerPage, sort)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Commands)