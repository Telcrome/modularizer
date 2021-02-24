from guibot.bot import GuiBot, Verbosity


async def main_routine(b: GuiBot) -> None:
    """
    Write your bot using top to bottom statement.
    For commands and sleep statements you can use the async/await syntax of asyncio.
    :param b: the bot instance
    """
    b.log('Starting the main function')
    answer = await b.send_command(
        {
            'cmd': 'Ping',  # Required field
            'to': 'debugconsole',
            'data': {}
        }
    )
    b.log(answer)

    b.log('Finished the main function')


if __name__ == '__main__':
    bot = GuiBot(
        channel_id="test",
        bot_id='python_script',
        logic=main_routine,
        verbosity=Verbosity.File)
